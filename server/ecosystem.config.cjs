module.exports = {
	apps: [
		{
			name: 'exchangelAPI',
			script: 'node ./dist/server/exchangelAPI.js',
			autorestart: true
		},
		{
			name: 'exchangelBot',
			script: 'node ./dist/server/exchangelBot.js',
			autorestart: true
		}
	]
}