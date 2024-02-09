import express, { Application } from "express";
import { config } from "dotenv";

import http from "http";
import cors from "cors";
import WebSocket from "ws";
import cron from "node-cron";
import session from "express-session";
import cookieParser from "cookie-parser";

import users from "./routes/users.route";
import draws from "./routes/draws.route";
import admin from "./routes/admin.route";

import { connect as connectWebSocket } from "./webSocket";
import { checkUpcomingDraws } from "./schedulers/draw.scheduler";

/* ---------------------------------------------------------------------- */

config();

const app = express();
const server: http.Server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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

// Set up scheduler to check for upcoming draws every 4 hours
cron.schedule("0 */4 * * *", checkUpcomingDraws);
// cron.schedule('*/2 * * * *', checkUpcomingDraws); // (every 2 min) Remove after testing

// Connect WebSocket to server
connectWebSocket(wss);

export { wss, server };