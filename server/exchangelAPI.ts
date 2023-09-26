import { app } from './tools/index'
import { OKX } from './tools/API'

// (async () => {
// 	try {
// 		console.log((await OKX.get('/api/v5/public/instruments', { params: { instType: 'SPOT' } })).data)
// 	}
// 	catch (e) {
// 		console.error(e.message)
// 	}

// })()

app.listen(2096)