const smartRound = (number: number) => {
    if (number === 0) return 0

    const magnitude = Math.floor(Math.log10(Math.abs(number)))
    let precision = Math.abs(magnitude) + 2

    if (magnitude >= 0) {
        precision = Math.min(precision, 2)
    }

    return Number(number.toFixed(precision))
}

export default smartRound