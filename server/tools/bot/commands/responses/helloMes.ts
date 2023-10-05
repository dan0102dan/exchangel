import { Markup } from 'telegraf'

export default async (ctx) => {
	await ctx.reply(
		'Welcome to Exchangel!',
		{
			parse_mode: 'HTML',
			...Markup.inlineKeyboard([
				[Markup.button.webApp('Open Mini App', 'https://dan0102dan.github.io/exchangel/#/')],
			])
		}
	)
}