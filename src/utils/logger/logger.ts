import log4js from "log4js";
import { config } from "dotenv";

config();

const PROD = process.env.NODE_ENV === "production";

log4js.configure({
  appenders: {
    out: { type: "console" },
    app: { type: "file", filename: "./src/utils/logger/logs/application.log" },
  },
  categories: {
    default: { appenders: ["out"], level: "trace" },
    app: { appenders: ["app"], level: "trace" },
  },
});

class Logger {
  private static defLogger = log4js.getLogger();
  private static appLogger = log4js.getLogger("app");

  static debug(msg: string) {
    PROD ? this.appLogger.debug(msg) : this.defLogger.debug(msg);
  }

  static info(msg: string) {
    PROD ? this.appLogger.info(msg) : this.defLogger.info(msg);
  }

  static warn(msg: string) {
    PROD ? this.appLogger.warn(msg) : this.defLogger.warn(msg);
  }

  static error(msg: string) {
    PROD ? this.appLogger.error(msg) : this.defLogger.error(msg);
    // TODO -> send email to admin
  }
}

export default Logger;
