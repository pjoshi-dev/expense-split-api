const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const tripRouter = require("./routes/trip-route");
const esRouter = require("./routes/expense-split-route");

const app = express();

const port = "4000";

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/ex-split", esRouter);
app.use("/trip", tripRouter);

app.set("port", port);
const server = http.createServer(app);
server.listen(port);
server.on("error", (error) => {
  console.error(error);
});
server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Server started successfully!");
  console.log("Listening on " + bind);
});

module.exports = app;
