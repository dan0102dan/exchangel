import { app } from './tools/index'
import { dataSync } from './tools/index'

dataSync(60 * 60 * 1000)

app.listen(49300)