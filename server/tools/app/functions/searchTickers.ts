import { db } from '../../../tools/index'

export default async (query) => {
    const regexQuery = new RegExp(query.split('').join('-?'), 'i')

    const tickers = await db.Tickers.find(
        { instId: regexQuery }
    )
        .populate('baseCcy')
        .populate('quoteCcy')
        .lean()

    const firstMatches = []
    const otherMatches = []

    for (const ticker of tickers) {
        if (regexQuery.test(ticker.instId)) {
            if (ticker.instId.toLowerCase().indexOf(query.toLowerCase()) === 0) {
                firstMatches.push(ticker)
            } else {
                otherMatches.push(ticker)
            }
        }
    }

    const sortedTickers = firstMatches.concat(otherMatches).sort((a, b) => {
        const aMatch = regexQuery.test(a.instId)
        const bMatch = regexQuery.test(b.instId)

        if (aMatch && !bMatch) {
            return -1
        } else if (!aMatch && bMatch) {
            return 1
        }

        const aHasUsdt = a.instId.toLowerCase().includes('usdt')
        const bHasUsdt = b.instId.toLowerCase().includes('usdt')

        if (aHasUsdt && !bHasUsdt) {
            return -1
        } else if (!aHasUsdt && bHasUsdt) {
            return 1
        }

        return 0
    })

    return sortedTickers
}