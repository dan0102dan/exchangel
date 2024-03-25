import { Markup } from 'telegraf'
import packageJson from '../../../../../web/package.json'

export default async (ctx) => {
	await ctx.reply(
		ctx.state.user.t('welcome'),
		{
			parse_mode: 'HTML',
			...Markup.inlineKeyboard([
				[Markup.button.webApp(ctx.state.user.t('openMiniApp'), `${packageJson.homepage}/#/`)],
			])
		}
	)
}