import { Markup } from 'telegraf'

export default async (ctx) => {
	await ctx.reply(
		'Hi',
		{
			parse_mode: 'HTML',
			...Markup.inlineKeyboard([
				[Markup.button.webApp('MiniApp', 'https://dan0102dan.github.io/exchangel')],
			])
		}
	)
}