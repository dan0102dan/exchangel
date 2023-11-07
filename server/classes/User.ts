import { db } from '../tools/index'

export default class User {
	id: number
	isNew: boolean
	favorites: string[]

	constructor(id: number) {
		this.id = id
	}

	async getUser() {
		this.isNew = !await db.Users.exists({ id: this.id })
		if (this.isNew)
			await new db.Users({ id: this.id }).save()

		const user = await db.Users.findOne({ id: this.id }, { favorites: 1 }).lean()
		this.favorites = user.favorites

		return this
	}
	async toggleFavorite(instId) {
		const index = this.favorites.indexOf(instId)
		if (index !== -1)
			this.favorites.splice(index, 1)
		else if (instId)
			this.favorites.unshift(instId)

		await db.Users.updateOne({ id: this.id }, { favorites: this.favorites })

		return this.favorites.some(e => e === instId)
	}
}