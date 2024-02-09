import WebSocket from "ws";
import Logger from "./utils/logger/logger";

/* ----- Types ----- */
type SendProps = {
  body: object;
  message?: string;
  type: "runningDraws";
};

export function connect(wss: WebSocket.Server) {
  wss.on("connection", (ws: WebSocket) => {
    Logger.info("Web Socket Client connected");

    ws.on("open", () => Logger.debug("New WebSocket connection opened"));

    ws.on("message", (message: string) =>
      Logger.debug(`WebSocket received message:\n ${message}`)
    );

    ws.on("error", (err: Error) => Logger.warn(`Error WebSocket:\n ${err}`));

    ws.on("close", () => Logger.info("WebSocket connection closed"));
  });
}

export function send(data: SendProps) {
  const wss = <WebSocket.Server>require("./server").wss;

  Logger.info("Sending message through WebSocket ...");

  wss.clients.forEach((client) => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        Logger.debug(`WebSocket client is ready`);
        client.send(
          JSON.stringify({
            body: data.body,
            type: data.type,
            message: data?.message,
          })
        );
      }
    } catch (err) {
      Logger.error(
        `Error sending information to the client through WebSocket:\n ${err}`
      );
    }
  });

  Logger.info("WebSocket informed");
}
