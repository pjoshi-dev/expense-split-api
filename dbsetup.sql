CREATE TABLE trip ( trip_id int NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, creator varchar(255) NOT NULL, status varchar(255) DEFAULT 'ACTIVE', PRIMARY KEY (trip_id) );

CREATE TABLE userDetails ( user_name varchar(255) NOT NULL, mobile_no int NOT NULL, email_id varchar(255) NOT NULL, user_password varchar(255) NOT NULL, PRIMARY KEY(email_id));

CREATE TABLE expense ( expense_description varchar(255) NOT NULL, expense_amount int NOT NULL, paid_by varchar(255) NOT NULL, trip_id int NOT NULL, FOREIGN KEY(trip_id) REFERENCES trip(trip_id));

CREATE TABLE user_trip_mapping (utm_id int NOT NULL AUTO_INCREMENT, trip_id int NOT NULL,email_id varchar(255) NOT NULL,PRIMARY KEY (utm_id), FOREIGN KEY(trip_id) REFERENCES trip(trip_id), FOREIGN KEY(email_id) REFERENCES userDetails(email_id));