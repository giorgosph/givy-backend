import { server } from "./server";
import Logger from "./utils/logger/logger";

const port: number = 3000;

server.listen(port, () => {
  Logger.info(`App listening at http://localhost:${port}`);
});
