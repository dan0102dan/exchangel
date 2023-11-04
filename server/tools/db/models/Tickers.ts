import mongoose from 'mongoose'

const { Schema } = mongoose
const tickersSchema = {
	baseCcy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Coin'
	},
	quoteCcy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Coin'
	},
	instId: {
		type: String,
		required: true,
		unique: true
	},
	instType: String,
	last: Number,
	open24h: Number,
	high24h: Number,
	low24h: Number,
	vol24h: Number
}

export default mongoose.model('Tickers', new Schema(tickersSchema))