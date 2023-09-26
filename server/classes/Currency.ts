import { db } from '../tools/index'

export default class Currency {
    id: number
    isNew: boolean

    constructor(id: number) {
        this.id = id
    }

    async getUser() {
        this.isNew = !await db.Users.exists({ id: this.id })
        if (this.isNew)
            await new db.Users({ id: this.id }).save()

        return this
    }
}