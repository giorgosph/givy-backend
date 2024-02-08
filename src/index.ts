import { server } from "./server";
import { logger } from "./utils/logger/logger";

const port: number = 3000;

server.listen(port, () => {
  logger.info(`App listening at http://localhost:${port}`);
});
