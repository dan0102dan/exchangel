import Koa from 'koa'
import Router from 'koa-router'
import cors from 'koa2-cors'
import koaBody from 'koa-body'
import { RateLimit } from 'koa2-ratelimit'
import { mainBot } from '../../config'
import { authorizeRequest, getTopData, searchTickers } from './functions'
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
        const sortedTickers = await searchTickers(ctx.query.query)

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