// Static SDK test double: fixture payloads are JSON, never generated source code.
window.Telegram = { WebApp: { initData: 'test', Serverless: {
  call(_name, _input, callback) {
    fetch('/__test/rates').then(response => response.json()).then(
      data => callback(data.error || null, data.result),
      error => callback({ message: error.message }),
    );
  },
} } };
