import axios from 'axios'
import { OKXAuth } from '../../config'
import { createHmac } from 'crypto'

const okxAxios = axios.create({
	baseURL: 'https://www.okx.com',
	headers: {
		'OK-ACCESS-KEY': OKXAuth.apiKey,
		'OK-ACCESS-PASSPHRASE': OKXAuth.passkey
	},
})

okxAxios.interceptors.request.use((config) => {
	const timestamp = new Date().toISOString()
	const method = config.method.toUpperCase()
	const requestPath = config.url
	const params = new URLSearchParams(config.params).toString()
	const body = JSON.stringify(config.data) || ''

	const prehashString = `${timestamp}${method}${requestPath}${params ? `?${params}` : ''}${body}`
	const signature = createHmac('sha256', OKXAuth.secretKey).update(prehashString).digest('base64')

	config.headers['OK-ACCESS-TIMESTAMP'] = timestamp
	config.headers['OK-ACCESS-SIGN'] = signature

	return config
})

export default okxAxios