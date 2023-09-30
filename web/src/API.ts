import axios from 'axios'

export const server = axios.create({
    baseURL: 'http://exchangel.dan0102dan.ru:49300',
    headers: {
        Authorization: (window as any).Telegram.WebApp.initData
    }
})