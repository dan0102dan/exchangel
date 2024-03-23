import { db } from '../../tools/index'
import { okxAxios } from "../API/index"

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
            console.error(item.instId, e)
        }
    }
}

const updateData = async () => {
    const { data } = (await okxAxios.get('/api/v5/market/tickers', { params: { instType: 'SPOT' } })).data
    for (const item of data)
        await db.Tickers.findOneAndUpdate(
            { instId: item.instId },
            { ...item }
        ).lean()
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