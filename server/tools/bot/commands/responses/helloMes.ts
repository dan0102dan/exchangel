import { Markup } from 'telegraf'
import packageJson from '../../../../../web/package.json'

export default async (ctx) => {
	await ctx.reply(
		'Welcome to Exchangel!',
		{
			parse_mode: 'HTML',
			...Markup.inlineKeyboard([
				[Markup.button.webApp('Open Mini App', `${packageJson.homepage}/#/`)],
			])
		}
	)
}