const express = require("express");
const cors = require("cors");
require("./src/db/mongoose");
const schoolRouter = require("./src/routers/school");
const substituteRouter = require("./src/routers/substitute");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.use(schoolRouter);
app.use(substituteRouter);

app.get("/", (req, res) => {
  res.send({ message: "Hello from server!" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
