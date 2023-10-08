import { db } from '../../../tools/index'

export default async (pipeline) => {
    const data = await db.Tickers.aggregate(pipeline)
    return await db.Tickers.populate(data, [{ path: 'baseCcy' }, { path: 'quoteCcy' }])
}