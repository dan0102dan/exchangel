import mongoose from 'mongoose'

const { Schema } = mongoose
const coinSchema = {
	ccy: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	logoLink: {
		type: String,
		required: true
	}
}

export default mongoose.model('Coin', new Schema(coinSchema))