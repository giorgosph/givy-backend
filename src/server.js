const express = require("express");
const cors = require("cors");
require("dotenv").config();

const users = require("./routes/usersRoute");

const {
  errorHandler,
  errorLogger,
  invalidPathHandler,
} = require("./middleware/errorHandlers");

const app = express();

app.use(cors());
app.use(express.json());

const apiRoute = "/api/v1";

app.use(`${apiRoute}/users`, users);

app.use(errorLogger);
app.use(errorHandler);
app.use(invalidPathHandler);

module.exports = app;
