import mongoose from 'mongoose'

const { Schema } = mongoose
const currencySchema = {
	id: {
		type: String,
		required: true
	},
	baseCcy: {
		type: String,
		required: true
	},
	quoteCcy: {
		type: String,
		required: true
	}
}

export default mongoose.model('Currency', new Schema(currencySchema))