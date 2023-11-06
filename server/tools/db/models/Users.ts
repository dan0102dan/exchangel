import mongoose from 'mongoose'

const { Schema } = mongoose
const userSchema = {
	id: {
		type: Number,
		required: true,
		unique: true
	},
	favorites: [String]
}

export default mongoose.model('Users', new Schema(userSchema))