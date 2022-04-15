const express = require("express");
require("dotenv").config();
const cors = require("cors");
require("./src/db/mongoose");
const Work = require("./src/Models/work");
const usersRouter = require("./src/routers/users");
const schoolRouter = require("./src/routers/school");
const substituteRouter = require("./src/routers/substitute");
const { isAuthenticated } = require("./src/shared/middlewares/middlewares");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors({ origin: "*" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

setInterval(async () => {
  await Work.deleteMany({ date: { $lt: new Date() } });
}, 86400000);

app.get("/", (req, res) => {
  res.send({ message: "hello" });
});
app.use(usersRouter);
app.use(isAuthenticated);
app.use(substituteRouter);
app.use(schoolRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));

module.exports = app;
