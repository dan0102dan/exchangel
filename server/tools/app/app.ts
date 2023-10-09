import Koa from 'koa'
import Router from 'koa-router'
import cors from 'koa2-cors'
import koaBody from 'koa-body'
import { RateLimit } from 'koa2-ratelimit'
import { mainBot } from '../../config'
import { authorizeRequest, getTopData } from './functions'
import { db } from '../../tools/index'

const app = new Koa()
const router = new Router()

app.use(cors({ origin: '*' }))
app.use(koaBody())

const limiter = RateLimit.middleware({
    interval: 1000,
    max: 5,
    message: 'Slow down'
})
app.use(limiter)

app.use(async (ctx, next) => {
    const isAuthorized = authorizeRequest(ctx.headers.authorization, mainBot.id, mainBot.token)

    if (isAuthorized) {
        await next()
    } else {
        ctx.status = 401
        ctx.body = 'Authorization failed'
    }
})

router.get('/home', async (ctx) => {
    try {
        const popular = {
            name: 'Popular',
            data: await db.Tickers.find({
                instId: { $in: ['TON-USDT', 'BTC-USDT', 'ETH-USDT', 'LTC-USDT', 'DOGE-USDT'] }
            })
                .populate('baseCcy')
                .populate('quoteCcy')
                .lean()
        }

        const gainers = {
            name: 'Gainers',
            data: await getTopData(-1)
        }

        const losers = {
            name: 'Losers',
            data: await getTopData(1)
        }

        const all = {
            name: 'All',
            data: await db.Tickers.find()
                .populate('baseCcy')
                .populate('quoteCcy')
                .lean()
        }

        ctx.status = 200
        ctx.body = { popular, gainers, losers, all }

    } catch (e) {
        console.error(e)
        ctx.status = 500
        ctx.body = { error: e.message }
    }
})

router.get('/getCcy', async (ctx) => {
    try {
        const { instId } = ctx.query
        const ccy = await db.Tickers.findOne({ instId })
            .populate('baseCcy')
            .populate('quoteCcy')
            .lean()
        ctx.status = 200
        ctx.body = ccy
    } catch (e) {
        console.error(e)
        ctx.status = 500
        ctx.body = { error: e.message }
    }
})

router.get('/search', async (ctx) => {
    try {
        const { query } = ctx.query
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

        ctx.status = 200
        ctx.body = sortedTickers
    } catch (e) {
        console.error(e)
        ctx.status = 500
        ctx.body = { error: e.message }
    }
})

app.use(router.routes())
export default app