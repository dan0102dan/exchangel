import mongoose from 'mongoose'

const { Schema } = mongoose
const userSchema = {
	id: {
		type: Number,
		required: true,
		unique: true
	},
	language_code: String,
	favorites: [String],
	subscriptions: [{
		instId: String,
		price: Number,
		trend: String
	}]
}

export default mongoose.model('Users', new Schema(userSchema))