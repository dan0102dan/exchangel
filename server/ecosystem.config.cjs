module.exports = {
	apps: [
		{
			name: 'exchangelAPI',
			script: 'node ./dist/exchangelAPI.js',
			autorestart: true
		},
		{
			name: 'exchangelBot',
			script: 'node ./dist/exchangelBot.js',
			autorestart: true
		}
	]
}