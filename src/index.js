const server = require("./server");
const port = 3000;

server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
