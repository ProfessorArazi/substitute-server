const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("./src/db/mongoose");
const Work = require("./src/Models/work");
const usersRouter = require("./src/routers/users");
const schoolRouter = require("./src/routers/school");
const substituteRouter = require("./src/routers/substitute");
const { isAuthenticated } = require("./src/shared/middlewares/middlewares");
/* 
todo:
1.notifications - finished
2.send mail - finished
3.images - finished
4.update profile
5.picked: remove appliers on pick - finished
6.mailing list - finished 
7. image update: update image on all user works
8. avoid clashes
9. error handling
*/

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
