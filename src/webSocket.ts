import WebSocket from "ws";
import { logger } from "./utils/logger/logger";

/* ----- Types ----- */
type SendProps = {
  body: object;
  message?: string;
  type: "runningDraws";
};

export function connect(wss: WebSocket.Server) {
  wss.on("connection", (ws: WebSocket) => {
    logger.info("Web Socket Client connected");

    ws.on("open", () => logger.debug("New WebSocket connection opened"));

    ws.on("message", (message: string) =>
      logger.debug(`WebSocket received message:\n ${message}`)
    );

    ws.on("error", (err: Error) => logger.warn(`Error WebSocket:\n ${err}`));

    ws.on("close", () => logger.info("WebSocket connection closed"));
  });
}

export function send(data: SendProps) {
  const wss = <WebSocket.Server>require("./server").wss;

  logger.info("Sending message through WebSocket ...");

  wss.clients.forEach((client) => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        logger.debug(`WebSocket client is ready`);
        client.send(
          JSON.stringify({
            body: data.body,
            type: data.type,
            message: data?.message,
          })
        );
      }
    } catch (err) {
      logger.error(
        `Error sending information to the client through WebSocket:\n ${err}`
      );
    }
  });

  logger.info("WebSocket informed");
}
