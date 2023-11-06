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
    const isAuthorized = process.env.NODE_ENV === 'development'
        ? true
        : authorizeRequest(ctx.headers.authorization, mainBot.id, mainBot.token)

    if (isAuthorized) {
        ctx.state.user = {}
        ctx.headers.authorization.split('&').forEach(param => {
            const [key, value] = param.split('=')

            if (['id'].includes(key))
                ctx.state.user[key] = decodeURIComponent(value)
        })

        await next()
    } else {
        ctx.status = 401
        ctx.body = 'Authorization failed'
    }
})

router.get('/home', async (ctx) => {
    const user = await db.Users.findOne({ id: ctx.state.user?.id })

    const favorites = await db.Tickers.find({
        instId: { $in: user?.favorites }
    })
        .populate('baseCcy')
        .populate('quoteCcy')
        .lean()

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
    ctx.body = { favorites, popular, gainers, losers, all }
})

router.get('/getCcy', async (ctx) => {
    const { instId } = ctx.query
    const user = await db.Users.findOne({ id: ctx.state.user?.id })

    const ccy = {
        ...await db.Tickers.findOne({ instId })
            .populate('baseCcy')
            .populate('quoteCcy')
            .lean(),
        isFavorite: user?.favorites.includes(instId)
    }
    console.log(ccy.isFavorite)

    ctx.status = 200
    ctx.body = ccy
})

router.get('/search', async (ctx) => {
    const sortedTickers = await searchTickers(ctx.query.query)

    ctx.status = 200
    ctx.body = sortedTickers
})

router.get('/toggleFavorite', async (ctx) => {
    const { instId } = ctx.query
    const user = await db.Users.findOne({ id: ctx.state.user?.id })

    if (!user) throw new Error('User not found')

    const index = user.favorites.indexOf(instId)
    if (index !== -1)
        user.favorites.splice(index, 1)
    else if (instId)
        user.favorites.unshift(instId)

    await user.save()

    ctx.status = 200
    ctx.body = user.favorites.some(e => e === instId)
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