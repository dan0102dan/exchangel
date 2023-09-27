import { Markup } from 'telegraf'

export default async (ctx) => {
	await ctx.reply(
		'Hi',
		{
			parse_mode: 'HTML',
			...Markup.inlineKeyboard([
				[Markup.button.webApp('MiniApp', 'https://192.168.1.107:3000/exchangel')],
			])
		}
	)
}