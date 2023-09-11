const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "68.178.165.125",
  user: "exp-data",
  password: "exp-data",
  database: "expense_split_db",
  insecureAuth: true,
  port: 3306,
});

module.exports = { connection };
