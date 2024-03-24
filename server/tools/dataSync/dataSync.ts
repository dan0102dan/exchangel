import { db, bot } from '../../tools/index'
import { okxAxios } from "../API/index"
import { Markup } from 'telegraf'

const updateCurrency = async () => {
    const { data } = (await okxAxios.get('/api/v5/asset/currencies')).data
    for (const cur of data) {
        await db.Coin.findOneAndUpdate(
            { ccy: cur.ccy },
            { ...cur },
            { upsert: true, new: true }
        ).lean()
    }
}

const searchPair = async () => {
    const { data } = (await okxAxios.get('/api/v5/public/instruments', { params: { instType: 'SPOT' } })).data
    for (const item of data) {
        try {
            const { _id: baseCcy } = await db.Coin.findOne({ ccy: item.baseCcy }, { _id: 1 })
            const { _id: quoteCcy } = await db.Coin.findOne({ ccy: item.quoteCcy }, { _id: 1 })

            await db.Tickers.findOneAndUpdate(
                { instId: item.instId },
                {
                    ...item,
                    baseCcy,
                    quoteCcy
                },
                { upsert: true, new: true }
            ).lean()
        }
        catch (e) {
            // console.error(item.instId, e)
            continue
        }
    }
}

const updateData = async () => {
    const { data } = (await okxAxios.get('/api/v5/market/tickers', { params: { instType: 'SPOT' } })).data
    for (const ticker of data) {
        const prevTicker = await db.Tickers.findOneAndUpdate(
            { instId: ticker.instId },
            { ...ticker },
            { projection: { last: 1 }, returnDocument: 'before' }
        ).lean()

        const users = await db.Users.find({ 'subscriptions.instId': ticker.instId })
        for (const user of users) {
            for (const sub of user.subscriptions) {
                const priceCrossed = (prevTicker.last < sub.price && sub.price <= ticker.last) || (prevTicker.last > sub.price && sub.price >= ticker.last)
                if (priceCrossed && (sub.trend === "any" ||
                    (sub.trend === "up" && prevTicker.last <= ticker.last) ||
                    (sub.trend === "down" && prevTicker.last >= ticker.last))) {
                    console.log('Notification triggered')

                    bot.telegram.sendMessage(
                        user.id,
                        `<b>Price Alert</b> ${prevTicker.last < ticker.last ? '📈' : '📉'} for <b>${sub.instId}</b>\n\n<b>Threshold:</b> ${sub.price}\n<b>Previous:</b> ${prevTicker.last}\n<b>Current:</b> ${ticker.last}\n\nTrend: ${sub.trend === 'up' ? 'Ascending 📈' : sub.trend === 'down' ? 'Descending 📉' : 'Any'}`,
                        {
                            parse_mode: 'HTML',
                            ...Markup.inlineKeyboard([
                                [Markup.button.webApp('Open Mini App', `https://dan0102dan.github.io/exchangel/#/ccy/${sub.instId}`)],
                            ])
                        }
                    ).catch(console.error)
                }
            }
        }
    }
}

const updater = async (period) => {
    console.log('Updating the database...')
    try {
        await updateCurrency()

        await searchPair()

        await updateData()
    }
    catch (e) {
        console.error(e.message)
    }

    console.log(`Completed, sleeping ${period / 1000}s...`)
    setTimeout(updater, period, period)
}

export default updater