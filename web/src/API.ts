import axios from 'axios'

export const server = axios.create({
    baseURL: 'https://exchangel.dan0102dan.ru:2096',
    headers: {
        Authorization: (window as any).Telegram.WebApp.initData
    }
})