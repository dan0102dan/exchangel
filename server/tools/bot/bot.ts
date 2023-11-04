import { User } from '../../classes'
import { Telegraf } from 'telegraf'
import { mainBot } from '../../config'

import { helloMes } from './commands/responses'
import { search } from './commands/inlineQuery'

const bot = new Telegraf(mainBot.id + ':' + mainBot.token)

bot.catch(console.error)
bot.use(async (ctx, next) => {
	if (!ctx.from?.is_bot && ctx.from?.id !== undefined) {
		ctx.state.user = await new User(ctx.from.id).getUser()

		return next()
	}
})

bot.start(helloMes)

bot.on('inline_query', search)

export default bot