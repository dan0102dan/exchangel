import axios from 'axios'

export const server = axios.create({
    baseURL: 'https://exchangel.dan0102dan.ru',
    headers: {
        authorization: (window as any).Telegram.WebApp.initData
    }
})