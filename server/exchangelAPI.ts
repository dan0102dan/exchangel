import { app } from './tools/index'
import { dataSync } from './tools/index'

dataSync(60 * 2 * 1000)

app.listen(process.env.NODE_ENV === 'development'
    ? 49301
    : 49300)