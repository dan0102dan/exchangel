import { createHmac } from 'crypto'

export default (initData = '', botId: number, botToken: string): boolean => {
    const params = {}
    let hash = ''

    initData.split('&').forEach(param => {
        const [key, value] = param.split('=')
        if (key === 'hash') {
            hash = value
            return
        }
        params[key] = decodeURIComponent(value)
    })

    const sortedKeys = Object.keys(params).sort()

    const computedHash = createHmac('sha256', createHmac('sha256', 'WebAppData').update(botId + ':' + botToken).digest())
        .update(sortedKeys.map(key => `${key}=${params[key]}`).join('\n'))
        .digest()
        .toString('hex')

    return computedHash === hash
}