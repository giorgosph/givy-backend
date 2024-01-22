const log4js = require('log4js');
require("dotenv").config();

const PROD = process.env.NODE_ENV === 'production';

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

const defLogger = log4js.getLogger();
const appLogger = log4js.getLogger("app");

const log = {
  debug: (msg) => PROD ? appLogger.debug(msg) : defLogger.debug(msg),
  info: (msg) =>  PROD ? appLogger.info(msg) : defLogger.info(msg),
  warn: (msg) => PROD ? appLogger.warn(msg) : defLogger.warn(msg),
  error: (msg) => {
    PROD ? appLogger.error(msg) : defLogger.error(msg)
    // TODO -> send email to admin
  },
}

module.exports = log;