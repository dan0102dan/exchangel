import { smartRound } from './'

const formatNumber = (input: number | string): string => {
    if (typeof input === 'string') {
        input = input.replace(/ /g, '')
    }

    const num = Number(input)
    if (isNaN(num)) return input.toString()

    const rounded = smartRound(num)

    let formatted = rounded.toLocaleString('ru-RU', {
        useGrouping: true,
        maximumFractionDigits: 20
    }).replace(/,/g, '.')

    formatted = formatted.replace(/(\.\d*?[1-9])0+$/g, '$1').replace(/\.$/, '')
    return formatted
}

export default formatNumber