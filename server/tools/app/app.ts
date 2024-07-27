import Koa from 'koa'
import Router from 'koa-router'
import cors from 'koa2-cors'
import koaBody from 'koa-body'
import { RateLimit } from 'koa2-ratelimit'
import { mainBot } from '../../config'
import { authorizeRequest, getTopData, searchTickers } from './functions'
import { db } from '../../tools/index'
import { User } from '../../classes'

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
    const isAuthorized = process.env.NODE_ENV === 'development'
        ? true
        : authorizeRequest(ctx.headers.authorization, mainBot.id, mainBot.token)

    if (isAuthorized) {
        for (const param of ctx.headers.authorization.split('&')) {
            const [key, value] = param.split('=')
            if (key === 'user') {
                const { id, language_code } = JSON.parse(decodeURIComponent(value))
                ctx.state.user = await new User(id, language_code).init()
                break
            }
        }

        await next()
    } else {
        ctx.status = 401
        ctx.body = 'Authorization failed'
    }
})

router.get('/home', async (ctx) => {
    let favorites = await db.Tickers.find({
        instId: { $in: ctx.state.user?.favorites }
    })
        .populate('baseCcy')
        .populate('quoteCcy')
        .lean()

    const favoritesMap = new Map(favorites.map((favorite) => [favorite.instId, favorite]))
    favorites = ctx.state.user?.favorites?.map((instId) => favoritesMap.get(instId))

    const popular = {
        name: 'popular',
        data: await db.Tickers.find({
            instId: { $in: ['TON-USDT', 'BTC-USDT', 'ETH-USDT', 'LTC-USDT', 'DOGE-USDT'] }
        })
            .populate('baseCcy')
            .populate('quoteCcy')
            .lean()
    }

    const gainers = {
        name: 'gainers',
        data: await getTopData(-1)
    }

    const losers = {
        name: 'losers',
        data: await getTopData(1)
    }

    ctx.status = 200
    ctx.body = { favorites, popular, gainers, losers }
})

router.get('/getCcy', async (ctx) => {
    const { instId } = ctx.query

    const ccy = {
        ...await db.Tickers.findOne({ instId: { $eq: instId } })
            .populate('baseCcy')
            .populate('quoteCcy')
            .lean(),
        isFavorite: ctx.state.user?.favorites.includes(instId)
    }

    ctx.status = 200
    ctx.body = ccy
})

router.get('/search', async (ctx) => {
    const { query } = ctx.query

    const sortedTickers = await searchTickers(query.trim())

    ctx.status = 200
    ctx.body = sortedTickers
})

router.get('/toggleFavorite', async (ctx) => {
    const { instId } = ctx.query

    const isFavorite = await ctx.state.user.toggleFavorite(instId)

    ctx.status = 200
    ctx.body = isFavorite
})

router.get('/subscriptions', async (ctx) => {
    const { instId } = ctx.query

    const subscriptions = ctx.state.user.subscriptions.filter(e => e.instId === instId)

    ctx.status = 200
    ctx.body = subscriptions
})

router.get('/subscribe', async (ctx) => {
    const { instId, price, trend } = ctx.query

    const subscriptions = await ctx.state.user.subscribe(instId, price, trend)

    ctx.status = 200
    ctx.body = subscriptions
})
router.get('/unsubscribe', async (ctx) => {
    const { instId, price, trend } = ctx.query

    const subscriptions = await ctx.state.user.unsubscribe(instId, price, trend)

    ctx.status = 200
    ctx.body = subscriptions
})

app.use(async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        ctx.status = err.status || 500
        ctx.body = { error: err.message }
        ctx.app.emit('error', err, ctx)
    }
})

app.use(router.routes())
export default app