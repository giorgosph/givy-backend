const express = require("express");
const http = require('http');
const WebSocket = require('ws');

const cors = require("cors");
const cron = require('node-cron');

require("dotenv").config();

const users = require("./routes/users.route");
const draws = require("./routes/draws.route");

const ws = require("./webSocket");

const checkUpcomingDraws = require("./schedulers/draw.scheduler").checkUpcomingDraws;

/* ---------------------------------------------------------------------- */

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const apiRoute = "/api/v1";

app.use(cors());
app.use(express.json());

// Set up routes
app.use(`${apiRoute}/users`, users);
app.use(`${apiRoute}/draws`, draws);

// Set up scheduler to check for upcoming draws every 4 hours
cron.schedule('0 */4 * * *', checkUpcomingDraws);
// cron.schedule('*/2 * * * *', checkUpcomingDraws); // (every 2 min) Remove after testing 

// Connect WebSocket to server
ws.connect(wss);

module.exports = {
  wss,
  server,
};
