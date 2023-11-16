const db = require("./db");
const fs = require("fs");

const initTables = fs.readFileSync(__dirname + "/init.sql").toString();

db.query(initTables, (err, result) => {
  err ? console.log(err) : console.log(result);
});
