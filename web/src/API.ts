import axios from 'axios'

export const server = axios.create({
    baseURL: 'https://exchangel.dan0102dan.ru',
    headers: {
        Authorization: (window as any).Telegram.WebApp.initData
    }
})