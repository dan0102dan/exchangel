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
	last: String,
	open24h: String,
	high24h: String,
	low24h: String,
	vol24h: String
}

export default mongoose.model('Tickers', new Schema(tickersSchema))