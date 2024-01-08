const WebSocket = require('ws');

const connect = (wss) => {
  wss.on('connection', (ws) => {
    console.log('Web Socket Client connected');
    
    ws.on('open', () => console.log('New WebSocket connection opened'));
  
    ws.on('message', (message) => console.log(`WebSocket received message:\n ${message}`));
    
    ws.on('error', (err) => console.error(`Error WebSocket:\n ${err}`));
    
    ws.on('close', () => console.log('WebSocket connection closed'));
  });
};

const send = (data) => {
  const wss = require('./server').wss;

  console.log('Sending message through WebSocket ...');

  wss.clients.forEach((client) => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        console.log("WebSocket client is ready");
        client.send(JSON.stringify({ body: data?.body, message: data?.message, type: data?.type }));
      }
    } catch (err) {
      console.error("Error sending information to the client through WebSocket:\n", err);
    }
  });
};


module.exports = {
  send,
  connect,
}