const server = require("./server").server;
const log = require("./utils/logger/logger");

const port = 3000;

server.listen(port, () => {
  log.info(`App listening at http://localhost:${port}`);
});
