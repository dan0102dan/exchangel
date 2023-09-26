import axios from 'axios'

export const OKX = axios.create({
	baseURL: 'https://www.okx.com'
})