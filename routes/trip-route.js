const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const { connection } = require("../config/db");
// const connection = mysql.createConnection({
//   host: "sql12.freesqldatabase.com",
//   user: "sql12643982",
//   password: "mS5NtJWRvN",
//   database: "sql12643982",
// });
// ALTER USER 'exp-data'@'%' IDENTIFIED WITH mysql_native_password BY 'exp-data';

// mandapes2004@gmail.com
//       expense@23split

router.get("/test-db", (req, resp, next) => {
  try {
    // connection.connect();
    connection.query("SELECT 1 + 1 AS solution", (err, rows, fields) => {
      if (err) throw err;
      console.log("The solution is: ", rows[0].solution);
      resp.json(rows[0].solution);
    });
  } catch (error) {
    console.error(error);
    resp.status(500).send();
  } finally {
    // connection.end();
  }
});

router.post("/create", function (req, res, next) {
  const inputTrip = req.body;
  const tripId = Math.floor(Math.random() * 1000 + 1);
  const tripname = inputTrip.tripname;
  const creator = inputTrip.creator;
  const status = "ACTIVE";

  const query = `INSERT INTO TRIP (name, creator) VALUES ('${tripname}', '${creator}');`;

  connection.query(query, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
      // return;
    } else {
      console.log(result);
    }
  });
  res.json({ success: true, message: "Trip created" });
});

router.post("/invite", function (req, res, next) {
  const input = req.body;
  const tripId = input.tripId;
  const friendEmail = input.friendEmail;
  const id = Math.random();
  console.log(input);
  // save invitation in DB

  res.send("invitation created");
});

router.post("/active", function (req, res, next) {
  const input = req.body;
  const email = input.email;

  // from DB find this
  // status = active, creator = email and invitaion contains email
  console.log(input);
  // save in DB
  res.json({ trips: [] });
});

router.get("/details/:tripId", function (req, res, next) {
  const tripId = req.params.tripId;
  // from DB find this
  // status = active, creator = email and invitaion contains email
  console.log(input);
  // save in DB
  res.json({ trip: {} });
});

module.exports = router;
