const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "xxxxxxxx",
  user: "exp-data",
  password: "xxxxxxxxx",
  database: "expense_split_db",
  insecureAuth: true,
  port: 3306,
});

module.exports = { connection };
