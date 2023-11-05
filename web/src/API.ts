import axios from 'axios'

const baseURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:49300'
    : 'https://exchangel.dan0102dan.ru'

export const server = axios.create({
    baseURL,
    headers: {
        authorization: (window as any).Telegram.WebApp.initData
    }
})