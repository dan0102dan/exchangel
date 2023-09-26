import { createHmac } from 'crypto'

export default (initData, botId, botToken) => {
    const searchParams = new URLSearchParams(initData)

    let hash = ''
    const pairs = []

    searchParams.forEach((value, key) => {
        if (key === 'hash') {
            hash = value
            return
        }

        pairs.push(`${key}=${value}`)
    })

    pairs.sort()

    const computedHash = createHmac('sha256', createHmac('sha256', 'WebAppData').update(botId + ':' + botToken).digest())
        .update(pairs.join('\n'))
        .digest()
        .toString('hex')

    return computedHash === hash
}