import axios from 'axios'

export const server = axios.create({
    baseURL: 'http://localhost:2096',
    headers: {
        Authorization: (window as any).Telegram.WebApp.initData
    }
})