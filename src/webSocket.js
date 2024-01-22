const WebSocket = require('ws');
const log = require("./utils/logger/logger");

const connect = (wss) => {
  wss.on('connection', (ws) => {
    log.info('Web Socket Client connected');
    
    ws.on('open', () => log.debug('New WebSocket connection opened'));
  
    ws.on('message', (message) => log.debug(`WebSocket received message:\n ${message}`));
    
    ws.on('error', (err) => log.warn(`Error WebSocket:\n ${err}`));
    
    ws.on('close', () => log.info('WebSocket connection closed'));
  });
};

const send = (data) => {
  const wss = require('./server').wss;

  log.info('Sending message through WebSocket ...');

  wss.clients.forEach((client) => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        log.debug(`WebSocket client is ready`);
        client.send(JSON.stringify({ body: data?.body, message: data?.message, type: data?.type }));
      }
    } catch (err) {
      log.error(`Error sending information to the client through WebSocket:\n ${err}`);
    }
  });

  log.info('WebSocket informed');
};


module.exports = {
  send,
  connect,
}