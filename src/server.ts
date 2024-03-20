import express from "express";
import { config } from "dotenv";

import http from "http";
import cors from "cors";
import WebSocket from "ws";
import cron from "node-cron";
import session from "express-session";
import * as clicksend from "clicksend";
import cookieParser from "cookie-parser";

import users from "./routes/users.route";
import draws from "./routes/draws.route";
import admin from "./routes/admin.route";
import product from "./routes/product.route";

import { createBucket } from "./aws";
import { createFirebaseAdminApp } from "./firebase";
import { connect as connectWebSocket } from "./webSocket";
import { checkUpcomingDraws } from "./schedulers/draw.scheduler";

// var api = require('../node_modules/clicksend/api.js');

/* ---------------------------------------------------------------------- */

config();

const app = express();
const server: http.Server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const smsApi = new clicksend.SMSApi(
  process.env.CLICKSEND_USERNAME as string,
  process.env.CLICKSEND_API_KEY as string
);

const apiRoute: string = "/api/v1";

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET as string,
    resave: false,
    saveUninitialized: true,
  })
);

// Set up routes
app.use(`${apiRoute}/users`, users);
app.use(`${apiRoute}/draws`, draws);
app.use(`${apiRoute}/admin`, admin);
app.use(`${apiRoute}/product`, product);

// Set up scheduler to check for upcoming draws every 4 hours
cron.schedule("0 */4 * * *", checkUpcomingDraws);
// cron.schedule('*/2 * * * *', checkUpcomingDraws); // (every 2 min) Remove after testing

// Connect WebSocket to server
connectWebSocket(wss);

// Initialize Firebase for push notifications
createFirebaseAdminApp();

// Create S3 Bucket
createBucket();

export { wss, smsApi, server };
