import { db, bot } from '../../tools/index'
import { User } from '../../classes'
import { okxAxios } from "../API/index"
import { Markup } from 'telegraf'
import packageJson from '../../../web/package.json'

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

        const users = await db.Users.find({ 'subscriptions.instId': ticker.instId }).lean()
        for (const user of users) {
            const u = new User(user.id, user.language_code)

            for (const sub of user.subscriptions) {
                const priceCrossed = (prevTicker.last < sub.price && sub.price <= ticker.last) || (prevTicker.last > sub.price && sub.price >= ticker.last)
                if (priceCrossed && (sub.trend === "any" ||
                    (sub.trend === "up" && prevTicker.last <= ticker.last) ||
                    (sub.trend === "down" && prevTicker.last >= ticker.last))) {
                    console.log('Notification triggered')

                    bot.telegram.sendMessage(
                        user.id,
                        `<b>${sub.instId}</b> ${prevTicker.last < ticker.last ? '📈' : '📉'} <b>${u.t('current')}:</b> ${ticker.last}\n\n<b>${u.t('price')} ${u.t('alert')}!</b>\n\n<b>${u.t('threshold')}:</b> ${sub.price}\n<b>${u.t('previous')}:</b> ${prevTicker.last}\n\n<b>${u.t('trend')}</b>: ${sub.trend === 'up' ? u.t('up') : sub.trend === 'down' ? u.t('down') : u.t('any')}`,
                        {
                            parse_mode: 'HTML',
                            ...Markup.inlineKeyboard([
                                [Markup.button.webApp(u.t('openMiniApp'), `${packageJson.homepage}/#/ccy/${sub.instId}`)],
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