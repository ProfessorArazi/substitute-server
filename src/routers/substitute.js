const express = require("express");
const School = require("../Models/school");
const router = new express.Router();
const Work = require("../Models/work");
const mailSender = require("../shared/mailSender/mailSender");
const {
  sendSub,
  clearNotifications,
  updateProfile,
} = require("../shared/methods/methods");

router.post("/works", async (req, res) => {
  const { city, minHours, maxHours, startDate, endDate } = req.body;
  const filter = { taken: { _id: "" } };
  if (city) {
    filter.city = city;
  }
  if (minHours && maxHours) {
    filter.hours = { $gte: +minHours, $lte: +maxHours };
  } else if (minHours) {
    filter.hours = { $gte: +minHours };
  } else if (maxHours) {
    filter.hours = { $lte: +maxHours };
  }

  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    filter.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.date = { $lte: new Date(endDate) };
  } else {
    const now = new Date();
    filter.date = { $gte: now };
  }

  const token = req.user.tokens[req.user.tokens.length - 1].token;

  sendSub(req.user, token, res, filter);
});

router.post("/sub/works", async (req, res) => {
  const token = req.user.tokens[req.user.tokens.length - 1].token;
  sendSub(req.user, token, res, undefined, false);
});

router.post("/sub/works/apply", async (req, res) => {
  const sub = req.user;
  try {
    let work = (await Work.find(req.body.work))[0];
    if (!work) {
      return res.send({ error: "משהו השתבש, נסה לרענן את הדף..." });
    }
    await sub.addWork(work);
    work = work.addApply(sub);
    await work.save();
    const token = sub.tokens[sub.tokens.length - 1].token;
    sendSub(sub, token, res);
    const school = await School.findById(work.userId);
    school.notifications.push("מישהו הציע את עצמו לאחת העבודות שפרסמת");
    await school.updateWork(work._id, work);
    if (school.mailingList) {
      await mailSender(school.email, "מישהו הציע את עצמו לאחת העבודות שפרסמת");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/sub/works/apply/cancel", async (req, res) => {
  const sub = req.user;

  try {
    let work = await Work.findById(req.body.workId);
    if (!work) {
      return res.send({ error: "משהו השתבש, נסה לרענן את הדף..." });
    }
    await sub.deleteWork(req.body.workId);
    const token = sub.tokens[sub.tokens.length - 1].token;
    sendSub(sub, token, res);
    const school = await School.findById(req.body.userId).select("works");
    const index = work.applied.findIndex(
      (apply) => apply.apply._id.toString() === req.body.substituteId
    );
    work.applied.splice(index, 1);
    await work.save();
    await school.updateWork(req.body.workId, work);
  } catch (err) {
    console.log(err);
  }
});

router.put("/sub", async (req, res) => {
  const changes = Object.entries(req.body.changes);
  try {
    changes.forEach((change) => (req.user[change[0]] = change[1]));
    await req.user.save();
    const token = await req.user.generateAuthToken();

    sendSub(req.user, token, res);

    const userIds = req.user.works.map((work) => work.work.userId);
    const schools = await School.find({ _id: userIds }).select("works");
    updateProfile(req.user, schools, changes);
  } catch (error) {
    console.log(error);
  }
});

router.put("/sub/image", async (req, res) => {
  req.user.img = req.body.img;
  try {
    await req.user.save();
    const token = req.user.tokens[req.user.tokens.length - 1].token;
    sendSub(req.user, token, res);
    const userIds = req.user.works.map((work) => work.work.userId);
    const schools = await School.find({ _id: userIds }).select("works");
    updateProfile(req.user, schools, Object.entries({ img: req.body.img }));
  } catch (err) {
    console.log(err);
  }
});

router.post("/sub/notifications/clear", (req, res) => {
  clearNotifications(req.user);
});

module.exports = router;
