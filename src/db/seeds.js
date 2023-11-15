const db = require("./db.js");
const fs = require("fs");

const seeds = fs.readFileSync(__dirname + "/seeds.sql").toString();

db.query(seeds, (err, result) => {
  err ? console.log(err) : console.log(result);
});
