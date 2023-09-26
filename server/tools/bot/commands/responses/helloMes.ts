import { Markup } from 'telegraf'

export default async (ctx) => {
	await ctx.reply(
		'Hi',
		{
			parse_mode: 'HTML',
			...Markup.inlineKeyboard([
				[Markup.button.webApp('MiniApp', 'https://192.168.1.107:3000/exchangel?cur=%23tgWebAppData%3Dquery_id%253DAAGQzcstAAAAAJDNyy07C-6E%2526user%253D%25257B%252522id%252522%25253A768331152%25252C%252522first_name%252522%25253A%252522D%252522%25252C%252522last_name%252522%25253A%252522D%252522%25252C%252522username%252522%25253A%252522dan0102dan%252522%25252C%252522language_code%252522%25253A%252522en%252522%25252C%252522is_premium%252522%25253Atrue%25252C%252522allows_write_to_pm%252522%25253Atrue%25257D%2526auth_date%253D1695683953%2526hash%253D46ca85a0402e380db146a8527e9b315c9ce37a3379a840a38388e50e2f9266dc%26tgWebAppVersion%3D6.9%26tgWebAppPlatform%3Dmacos%26tgWebAppThemeParams%3D%257B%2522button_text_color%2522%253A%2522%2523ffffff%2522%252C%2522secondary_bg_color%2522%253A%2522%25230d0e10%2522%252C%2522hint_color%2522%253A%2522%2523b1c3d5%2522%252C%2522button_color%2522%253A%2522%2523475367%2522%252C%2522text_color%2522%253A%2522%2523ffffff%2522%252C%2522link_color%2522%253A%2522%2523475367%2522%252C%2522bg_color%2522%253A%2522%2523151619%2522%257D')],
			])
		}
	)
}