import { db } from '../tools/index'
import { checkParameters } from '../tools/app/functions'
import translations from '../../web/src/locales'

export default class User {
	id: number
	language_code: string
	isNew: boolean = false
	favorites: string[] = []
	subscriptions: {
		instId?: string,
		price?: number,
		trend?: string
	}[] = []

	constructor(id: number, language_code: string) {
		this.id = id
		this.language_code = language_code
	}

	async init() {
		let user = await db.Users.findOne({ id: this.id }).lean()

		if (!user) {
			user = await new db.Users({ id: this.id, favorites: [], subscriptions: [] }).save()
			this.isNew = true
		} else {
			this.isNew = false
		}

		const { favorites = [], subscriptions = [] } = user
		this.favorites = favorites
		this.subscriptions = subscriptions

		return this
	}

	t(key: string): string {
		return (translations[this.language_code]?.[key] || translations.en[key])
			?.replace(/{{(.*?)}}/g, (_, k) => translations[k] || k)
	}

	async toggleFavorite(instId) {
		checkParameters([instId])

		const index = this.favorites.indexOf(instId)
		if (index !== -1)
			this.favorites.splice(index, 1)
		else if (instId)
			this.favorites.unshift(instId)

		await db.Users.updateOne({ id: this.id }, { favorites: this.favorites })

		return this.favorites.some(e => e === instId)
	}

	async subscribe(instId, price, trend) {
		checkParameters([instId, price, trend])

		if (this.subscriptions.filter(e => e.instId === instId).length >= 100)
			throw new Error('Subscription limit of 100 reached')

		const exists = this.subscriptions.some(e => e.instId === instId && e.price == price && e.trend === trend)
		if (exists) throw new Error('Subscription already exists')

		this.subscriptions.push({ instId, price, trend })

		await db.Users.updateOne({ id: this.id }, { subscriptions: this.subscriptions })

		return this.subscriptions.filter(e => e.instId === instId)
	}
	async unsubscribe(instId, price, trend) {
		checkParameters([instId, price, trend])

		const updatedUser = await db.Users.findOneAndUpdate(
			{ id: this.id },
			{
				$pull: {
					subscriptions: { instId: instId, price: price, trend: trend }
				}
			},
			{ projection: { subscriptions: 1 }, returnDocument: 'after' }
		)

		if (!updatedUser)
			throw new Error('The subscription could not be deleted or the subscription was not found')

		return updatedUser.subscriptions.filter(e => e.instId === instId)
	}
}