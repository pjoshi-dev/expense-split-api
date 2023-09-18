const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const { connection } = require("../config/db");


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

  const query = `INSERT INTO userDetails (user_name, mobile_no, email_id, user_password) VALUES ('${fullname}', '${phonenumber}', '${emailid}','${userpassword}');`;

  connection.query(query, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
    } else {
      console.log(result);
      res.json({ success: true, message: "User created" });
      //res.redirect('login.html');
    }
  });
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
    } else {
      console.log(result);
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
    } else {
      console.log(result);
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

  const queryMine = `select * from trip where status = 'SETTLED' and creator = '${email}'`;
  const queryOther = `select * from user_trip_mapping where email_id = '${email}'`;
  
  const finalSettledMyTrips = [];
  await connection.query(queryMine, async (error, data) => {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      if(data && data.length>0){
      data.forEach((d) => finalSettledMyTrips.push(d));
      }
      console.log("------------- my trip details");
      console.log(finalSettledMyTrips);
      await connection.query(queryOther, async (error, data1) => {
        if (error) {
          res.sendStatus(500);
        } else {
          const otherTrips = data1.map((utm) => utm.trip_id);
          const otherTripsQuery = `select * from trip where status = 'SETTLED' and trip_id  in (${otherTrips.toString()})`;
          await connection.query(otherTripsQuery, (error, result) => {
            console.log("------------- other my trip details");
            if(result && result.length>0){
              result.forEach((d) => finalSettledMyTrips.push(d));
            }    
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

router.post("/settledTripDetails/:trip_id", (req, res, next) => {
  const tripId = req.params.trip_id;
  // from DB find this
  const settledtripexpenses = [];
  connection.query(
    "SELECT * FROM expense WHERE trip_id=?",
    [tripId],
    async (error, data) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        data.forEach((d) => settledtripexpenses.push(d));

        // Settlement

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
              async (error, userRows) => {
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
                  shares.push({ paid_by, share, balance: share });
                });
                console.log("shares --------- ", shares);

                const settlement = [];

                const givers = shares
                  .filter((person) => person.share < 0)
                  .sort((a, b) => a.share - b.share);
                const receivers = shares
                  .filter((person) => person.share > 0)
                  .sort((a, b) => a.share - b.share)
                  .reverse();
                console.log(givers);
                console.log(receivers);

                givers.forEach((giver, index) => {
                  if (giver.balance !== 0) {
                    receivers.forEach((receiver, rindex) => {
                      if (receiver.balance !== 0) {
                        if (
                          Math.abs(giver.balance) === Math.abs(receiver.balance)
                        ) {
                          settlement.push({
                            from: giver.paid_by,
                            to: receiver.paid_by,
                            amount: Math.abs(giver.balance),
                          });
                          giver.balance = 0;
                          receiver.balance = 0;
                        } else if (
                          Math.abs(giver.balance) > Math.abs(receiver.balance)
                        ) {
                          // Giver is more
                          settlement.push({
                            from: giver.paid_by,
                            to: receiver.paid_by,
                            amount: Math.abs(receiver.balance),
                          });
                          giver.balance = -(
                            Math.abs(giver.balance) - receiver.balance
                          );
                          receiver.balance = 0;
                        } else if (
                          Math.abs(giver.balance) < Math.abs(receiver.balance)
                        ) {
                          // Giver is more
                          settlement.push({
                            from: giver.paid_by,
                            to: receiver.paid_by,
                            amount: Math.abs(giver.balance),
                          });
                          giver.balance = 0;
                          receiver.balance =
                            receiver.balance - Math.abs(giver.balance);
                        }
                      }
                    });
                  }
                });

                // Construct the response JSON
                const tripInfo = {
                  trip_id: tripId,
                  total_users: numberOfUsers,
                  total_trip_expense: totalTripExpense,
                  perHead: perHead,
                  individual_shares: shares,
                  settlement,
                };
                const response = {
                  settledtripexpenses,
                  tripInfo,
                };
                res.send(response);
              }
            );
          }
        );
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
          async (error, userRows) => {
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
              shares.push({ paid_by, share, balance: share });
            });
            console.log("shares --------- ", shares);

            const settlement = [];

            const givers = shares
              .filter((person) => person.share < 0)
              .sort((a, b) => a.share - b.share);
            const receivers = shares
              .filter((person) => person.share > 0)
              .sort((a, b) => a.share - b.share)
              .reverse();
            console.log(givers);
            console.log(receivers);

            givers.forEach((giver, index) => {
              if (giver.balance !== 0) {
                receivers.forEach((receiver, rindex) => {
                  if (receiver.balance !== 0) {
                    if (
                      Math.abs(giver.balance) === Math.abs(receiver.balance)
                    ) {
                      settlement.push({
                        from: giver.paid_by,
                        to: receiver.paid_by,
                        amount: Math.abs(giver.balance),
                      });
                      giver.balance = 0;
                      receiver.balance = 0;
                    } else if (
                      Math.abs(giver.balance) > Math.abs(receiver.balance)
                    ) {
                      // Giver is more
                      settlement.push({
                        from: giver.paid_by,
                        to: receiver.paid_by,
                        amount: Math.abs(receiver.balance),
                      });
                      giver.balance = -(
                        Math.abs(giver.balance) - receiver.balance
                      );
                      receiver.balance = 0;
                    } else if (
                      Math.abs(giver.balance) < Math.abs(receiver.balance)
                    ) {
                      // Giver is more
                      settlement.push({
                        from: giver.paid_by,
                        to: receiver.paid_by,
                        amount: Math.abs(giver.balance),
                      });
                      giver.balance = 0;
                      receiver.balance =
                        receiver.balance - Math.abs(giver.balance);
                    }
                  }
                });
              }
            });

            const tripInfo = {
              trip_id: tripId,
              total_users: numberOfUsers,
              total_trip_expense: totalTripExpense,
              perHead: perHead,
              individual_shares: shares,
              settlement,
            };

            await connection.query(
              `UPDATE trip SET status = 'SETTLED' WHERE trip_id = ?;`,
              [tripId],
              (error, userRows) => {
                console.log("tripInfo --------- ", tripInfo);
                res.json(tripInfo);
              }
            );
          }
        );
      }
    );

  } catch (error) {
    console.error("Error fetching trip data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
