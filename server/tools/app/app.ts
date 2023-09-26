import Koa from 'koa'
import Router from 'koa-router'
import cors from '@koa/cors'
import koaBody from 'koa-body'
import { RateLimit } from 'koa2-ratelimit'
import { mainBot } from '../../config'
import { authorizeRequest } from './functions'

const app = new Koa()
const router = new Router()

app.use(cors())
app.use(koaBody())

const limiter = RateLimit.middleware({
    interval: 1000,
    max: 5,
    message: 'Slow down'
})
app.use(limiter)

app.use(async (ctx, next) => {
    const isAuthorized = authorizeRequest(ctx.headers.Authorization, mainBot.id, mainBot.token)

    if (isAuthorized) {
        await next()
    } else {
        ctx.status = 401
        ctx.body = 'Authorization failed'
    }
})

router.get('/search', async (ctx) => {
    ctx.status = 200
    ctx.body = 'ok'
})

app.use(router.routes())
export default app