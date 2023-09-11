const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "xxxxxx",
  user: "exp-data",
  password: "xxxxxxxxxx",
  database: "xxxxxxxxxxxxb",
  insecureAuth: true,
  port: 3306,
});

module.exports = { connection };
