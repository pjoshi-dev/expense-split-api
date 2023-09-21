import express, { Router } from "express";
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
import serverless from "serverless-http";

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const tripRouter = require("./routes/trip-route");
const esRouter = require("./routes/expense-split-route");

const api = express();
api.use(cors());
api.use(logger("dev"));
api.use(express.json());
api.use(express.urlencoded({ extended: false }));
api.use(cookieParser());

api.use("/.netlify/functions/api", indexRouter);
api.use("/.netlify/functions/api/users", usersRouter);
api.use("/.netlify/functions/api/ex-split", esRouter);
api.use("/.netlify/functions/api/trip", tripRouter);

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

// api.use("/api/", router);
api.use("/.netlify/functions/api", router);

export const handler = serverless(api);
