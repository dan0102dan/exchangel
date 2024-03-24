export default (params: Array<any>) => {
    for (const param of params)
        if (!param) throw new Error('Missing parameters')
}