import { Coin, Tickers, Users } from './models'
import mongoose from 'mongoose'

mongoose.set('strictQuery', false)
mongoose.connect('mongodb://localhost/exchangel', {
	connectTimeoutMS: 6000000
})
mongoose.connection.on('error', console.error)

export default { Coin, Tickers, Users }