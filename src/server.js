const express = require("express");
const cors = require("cors");
require("dotenv").config();

const users = require("./routes/users.route");
const draws = require("./routes/draws.route");

const app = express();

app.use(cors());
app.use(express.json());

const apiRoute = "/api/v1";

app.use(`${apiRoute}/users`, users);
app.use(`${apiRoute}/draws`, draws);

module.exports = app;
