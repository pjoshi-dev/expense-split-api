CREATE TABLE trip ( trip_id int NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, creator varchar(255) NOT NULL, status varchar(255) DEFAULT 'ACTIVE', PRIMARY KEY (trip_id) );

CREATE TABLE userDetails ( user_name varchar(255) NOT NULL, mobile_no int NOT NULL, email_id varchar(255) NOT NULL, user_password varchar(255) NOT NULL, PRIMARY KEY(email_id));

CREATE TABLE expense ( expense_description varchar(255) NOT NULL, expense_amount int NOT NULL, paid_by varchar(255) NOT NULL, trip_id int NOT NULL, FOREIGN KEY(trip_id) REFERENCES trip(trip_id));

CREATE TABLE user_trip_mapping (utm_id int NOT NULL AUTO_INCREMENT, trip_id int NOT NULL,email_id varchar(255) NOT NULL,PRIMARY KEY (utm_id), FOREIGN KEY(trip_id) REFERENCES trip(trip_id), FOREIGN KEY(email_id) REFERENCES userDetails(email_id));

-- CREATE TABLE Orders (
--     OrderID int NOT NULL,
--     OrderNumber int NOT NULL,
--     PersonID int,
--     PRIMARY KEY (OrderID),
--     FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
-- );

-- SELECT DISTINCT t.*
-- FROM trip AS t
-- INNER JOIN user_trip_mapping AS utm ON t.trip_id = utm.trip_id
-- WHERE t.status = 'active'
--   AND t.creator = 'logged_in_user'
--   AND utm.user_id = 'logged_in_user'
--   AND EXISTS (
--     SELECT 1
--     FROM user_trip_mapping AS utm2
--     WHERE utm2.user_id = 'logged_in_user'
--       AND utm2.trip_id <> t.trip_id
--   );

creator = me, status = active;
utm = uer id = me ;
get all trips from above and active = true
creator + utm

SELECT * FROM trip WHERE status = 'ACTIVE' AND creator='sarthak@gmail.com' AND SELECT * FROM user_trip_mapping WHERE email_id='sarthak@gmail.com' AND status='ACTIVE'

SELECT trip.*, user_trip_mapping.* FROM trip INNER JOIN user_trip_mapping ON trip.creator = user_trip_mapping.email_id WHERE trip.status = 'ACTIVE' AND user_trip_mapping.email_id = 'john@gmail.com';

trip_id: tripId,
              total_users: numberOfUsers,
              total_trip_expense: totalTripExpense,
              perHead: perHead,
              individual_shares: shares,
              // transactions: transactions,

CREATE TABLE settlementDetails ( settlement_trip_id int NOT NULL AUTO_INCREMENT, trip_id int NOT NULL, total_users int NOT NULL, total_trip_expense int NOT NULL,perHead int NOT NULL,individual_shares int NOT NULL,PRIMARY KEY (settlement_trip_id));

CREATE TABLE settlementPayment ( settlement_trip_id int NOT NULL, from_user int NOT NULL, to_user int NOT NULL, payable_amount int NOT NULL, FOREIGN KEY(settlement_trip_id) REFERENCES settlementDetails(settlement_trip_id));

INSERT INTO settlementDetails (trip_id,total_users,total_trip_expense,perHead,individual_shares)  VALUES(tripId,numberOfUsers,totalTripExpense,perHead,shares)

UPDATE trip SET status = "SETTLED" WHERE trip_id = tripId;