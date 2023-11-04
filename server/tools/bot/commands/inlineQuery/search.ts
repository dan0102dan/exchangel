import { searchTickers } from '../../../app/functions'
import { Markup } from 'telegraf'

export default async (ctx) => {
    const tgLimit = 50, offset = Number(ctx.inlineQuery.offset)

    const sortedTickers = await searchTickers(ctx.inlineQuery.query, offset, tgLimit)

    if (sortedTickers?.length > 0)
        await ctx.answerInlineQuery(
            sortedTickers.map(
                ticker => ({
                    type: 'photo',
                    id: ticker._id,

                    photo_url: ticker.baseCcy.logoLink,
                    thumb_url: ticker.baseCcy.logoLink,

                    title: ticker.instId,
                    description: ticker.baseCcy.name + ' — ' + ticker.quoteCcy.name,

                    caption: ticker.instId,
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                        [Markup.button.webApp('Open Mini App', 'https://dan0102dan.github.io/exchangel/#/ccy/' + ticker.instId)]
                    ])
                })
            ),
            {
                is_personal: false,
                cache_time: 0
            }
        )
}