const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
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

router.post("/signup", function (req, res, next) {
  const inputuserData = req.body;
  const fullname = inputuserData.fullname;
  const phonenumber = inputuserData.phonenumber;
  const emailid = inputuserData.emailid;
  const userpassword = inputuserData.userpassword;
  //const hashedpassword = bcrypt.hash(userpassword,20);

  const query = `INSERT INTO userDetails (user_name, mobile_no, email_id, user_password) VALUES ('${fullname}', '${phonenumber}', '${emailid}','${userpassword}');`;

  connection.query(query, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
      res.json("error", {
        message: "User registration failed. Please try again.",
      });
      // return;
    } else {
      console.log(result);
      res.json({ success: true, message: "User created" });
      //res.redirect('login.html');
    }
  });
  //res.json({ success: true, message: "User created" });
});

router.post("/login", function (req, res, next) {
  const inputuserData = req.body;
  const emailid = inputuserData.emailid;
  const userpassword = inputuserData.userpassword;

  const query = `SELECT * FROM userDetails WHERE email_id='${emailid}';`;

  connection.query(query, (error, result) => {
    if (error) {
      throw error;
    }
    if (result.length === 0) {
      return res.status(401).json({
        error: "Email or password is incorrect!",
      });
    }
    const user = result[0];
    const passwordMatch = bcrypt.compare(userpassword, user.user_password);
    if (passwordMatch) {
      // Create a session or JWT token here for authentication
      res.json({ message: "Login successful" });
    } else {
      res.status(401).json({ error: "Authentication failed" });
    }
  });
  //res.json({ success: true, message: "User created" });
});

router.post("/create", function (req, res, next) {
  const inputTrip = req.body;
  const tripId = Math.floor(Math.random() * 1000 + 1);
  const tripname = inputTrip.tripname;
  const creator = inputTrip.creator;
  const status = "ACTIVE";

  const query = `INSERT INTO trip (name, creator) VALUES ('${tripname}', '${creator}');`;

  connection.query(query, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
      // return;
    } else {
      console.log(result);
      res.status(200);
    }
  });
  res.json({ success: true, message: "Trip created" });
});

router.post("/invite", function (req, res, next) {
  const input = req.body;
  const tripId = input.tripId;
  const friendEmail = input.friendEmail;

  // save invitation in DB
  const query = `INSERT INTO user_trip_mapping ( trip_id, email_id) VALUES (${tripId}, '${friendEmail}')`;

  connection.query(query, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
      //res.json('error', { message: "User registration failed. Please try again." });
      // return;
    } else {
      console.log(result);
      // res.redirect('/login.html');
    }
  });
  res.json({ success: true, message: "Friend Added" });
});

router.post("/expense", function (req, res, next) {
  const inputExpense = req.body;
  const expenseDescription = inputExpense.expenseDescription;
  const expenseAmount = inputExpense.expenseAmount;
  const paidBy = inputExpense.paidBy;
  const tripId = inputExpense.tripId;

  // save invitation in DB
  const query = `INSERT INTO expense ( expense_description, expense_amount, paid_by, trip_id) VALUES ('${expenseDescription}','${expenseAmount}','${paidBy}','${tripId}');`;

  connection.query(query, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
      //res.json('error', { message: "User registration failed. Please try again." });
      // return;
    } else {
      console.log(result);
      // res.redirect('/login.html');
    }
  });
  res.json({ success: true, message: "Expense Added" });
});

router.post("/active", async (req, res, next) => {
  const input = req.body;
  const email = input.email;

  // from DB find this
  // -- creator = me, status = active;
  const queryMine = `select * from trip where status = 'ACTIVE' and creator = '${email}'`;
  const queryOther = `select * from user_trip_mapping where email_id = '${email}'`;
  // -- utm = uer id = me ;
  // -- get all trips from above and active = true
  // -- creator + utm
  // var query = `SELECT * FROM trip WHERE status = 'ACTIVE' AND creator = 'sarthak@gmail.com' AND EXISTS ( SELECT 1 FROM user_trip_mapping WHERE email_id = 'sarthak@gmail.com' AND status = 'ACTIVE');`;
  const finalMyTrips = [];
  await connection.query(queryMine, async (error, data) => {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      if (data && data.length > 0) {
        data.forEach((d) => finalMyTrips.push(d));
      }
      console.log("------------- my trip details");
      console.log(finalMyTrips);
      await connection.query(queryOther, async (error, data1) => {
        if (error) {
          // console.log(error);
          res.sendStatus(500);
        } else {
          const otherTrips = data1.map((utm) => utm.trip_id);
          // res.send(data1);
          const otherTripsQuery = `select * from trip where status = 'ACTIVE' and trip_id  in (${otherTrips.toString()})`;
          await connection.query(otherTripsQuery, (error, result) => {
            console.log("------------- other my trip details");
            if (result && result.length > 0) {
              result.forEach((d) => finalMyTrips.push(d));
            }
            console.log(finalMyTrips);
            res.send(finalMyTrips);
          });
        }
      });
    }
  });
});

router.post("/settled", async (req, res, next) => {
  const input = req.body;
  const email = input.email;

  // from DB find this
  // -- creator = me, status = active;
  const queryMine = `select * from trip where status = 'SETTLED' and creator = '${email}'`;
  const queryOther = `select * from user_trip_mapping where email_id = '${email}'`;
  // -- utm = uer id = me ;
  // -- get all trips from above and active = true
  // -- creator + utm
  // var query = `SELECT * FROM trip WHERE status = 'ACTIVE' AND creator = 'sarthak@gmail.com' AND EXISTS ( SELECT 1 FROM user_trip_mapping WHERE email_id = 'sarthak@gmail.com' AND status = 'ACTIVE');`;
  const finalSettledMyTrips = [];
  await connection.query(queryMine, async (error, data) => {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      data.forEach((d) => finalSettledMyTrips.push(d));
      console.log("------------- my trip details");
      console.log(finalSettledMyTrips);
      await connection.query(queryOther, async (error, data1) => {
        if (error) {
          // console.log(error);
          res.sendStatus(500);
        } else {
          const otherTrips = data1.map((utm) => utm.trip_id);
          // res.send(data1);
          const otherTripsQuery = `select * from trip where status = 'SETTLED' and trip_id  in (${otherTrips.toString()})`;
          await connection.query(otherTripsQuery, (error, result) => {
            console.log("------------- other my trip details");
            result.forEach((d) => finalSettledMyTrips.push(d));
            console.log(finalSettledMyTrips);
            res.send(finalSettledMyTrips);
          });
        }
      });
    }
  });
});

router.post("/details/:trip_id", (req, res, next) => {
  const tripId = req.params.trip_id;
  // from DB find this
  const tripexpenses = [];
  connection.query(
    "SELECT * FROM expense WHERE trip_id=?",
    [tripId],
    (error, data) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        data.forEach((d) => tripexpenses.push(d));
        console.log(tripexpenses);
        res.send(tripexpenses);
      }
    }
  );
});

router.post("/settlement/:trip_id", async (req, res) => {
  const tripId = req.params.trip_id;

  try {
    let totalTripExpense = 0;
    await connection.query(
      "SELECT SUM(expense_amount) as totalTripExpense FROM expense WHERE trip_id = ?",
      [tripId],
      async (error, expense) => {
        totalTripExpense = expense[0].totalTripExpense;
        console.log("totalTripExpense --------- ", totalTripExpense);

        // Per user

        // Get all users and their total expenses for the given trip_id
        const shares = [];
        let numberOfUsers = 1;
        await connection.query(
          "SELECT paid_by, SUM(expense_amount) as totalExpenses FROM expense WHERE trip_id = ? GROUP BY paid_by",
          [tripId],
          (error, userRows) => {
            // Calculate individual shares for each user
            numberOfUsers = userRows.length;
            console.log("numberOfUsers --------- ", numberOfUsers);

            // per head
            const perHead = totalTripExpense / numberOfUsers;
            console.log("perHead --------- ", perHead);

            userRows.forEach((person) => {
              const paid_by = person.paid_by;
              const totalExpenses = person.totalExpenses;
              const share = totalExpenses - perHead;
              shares.push({ paid_by, share });
            });
            console.log("shares --------- ", shares);

            // Construct the response JSON
            const tripInfo = {
              trip_id: tripId,
              total_users: numberOfUsers,
              total_trip_expense: totalTripExpense,
              perHead: perHead,
              individual_shares: shares,
              // transactions: transactions,
            };
            console.log("tripInfo --------- ", tripInfo);

            const settlement = [];
            settlement.push({
              from: "",
              to: "",
              amount: 123,
            });
            // from shares.... create 2 buckets - Receivers[] and Givers[] - descending order - max on top
            // loop Givers[] - loop on Receivers[]
            // compare giver[0] receiveer[0]
            // giver amout =
            // giver[0] > receiveer[0]   >>   give complete amount to receiver[0]

            res.json(tripInfo);
          }
        );
      }
    );

    // Calculate who should pay whom to settle the transaction
    // const transactions = [];
    // for (let i = 0; i < shares.length; i++) {
    //   for (let j = i + 1; j < shares.length; j++) {
    //     const debtor = shares[i].paid_by;
    //     const creditor = shares[j].paid_by;
    //     const amount = Math.min(
    //       Math.abs(shares[i].share),
    //       Math.abs(shares[j].share)
    //     );

    //     if (amount > 0) {
    //       transactions.push({ debtor, creditor, amount });
    //       shares[i].share += amount; // Update the debtor's share
    //       shares[j].share -= amount; // Update the creditor's share
    //     }
    //   }
    // }
  } catch (error) {
    console.error("Error fetching trip data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// status = active, creator = email and invitaion contains email
//console.log(input);
// save in DB
//res.json({ trip: {} });
// res.json({ success: true, message: "Trip details" });
module.exports = router;
