const express = require("express");
const School = require("../Models/school");
const router = new express.Router();
const Substitute = require("../Models/substitute");
const Work = require("../Models/work");
const mailSender = require("../shared/mailSender/mailSender");
const { sendSub, clearNotifications } = require("../shared/methods/methods");

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
    let work = await Work.findById(req.body.workId);
    await sub.addWork(work);
    work.applied = work.applied.concat({
      apply: {
        _id: sub._id,
      },
    });
    await work.save();
    const token = sub.tokens[sub.tokens.length - 1].token;
    sendSub(sub, token, res);
    work.applied = [];
    work = work.addApply(sub);

    const school = await School.findById(work.userId);
    school.notifications.push("מישהו הציע את עצמו לאחת העבודות שפרסמת");
    await school.updateWork(req.body.workId, work);
    mailSender(school.email, "מישהו הציע את עצמו לאחת העבודות שפרסמת");
  } catch (error) {
    console.log(error);
  }
});

router.put("/sub", async (req, res) => {
  try {
    const sub = await Substitute.findOneAndUpdate(
      req.body.id,
      req.body.changes,
      { new: true }
    );

    const token = await sub.generateAuthToken();

    sendSub(sub, token, res);
    for (let i = 0; i < sub.works.length; i++) {
      const work = await Work.findById(sub.works[i].work.id.toString());
      await work.updateApply(req.body.id, sub);
      const school = await School.findById(work.userId);
      school.updateWork(work.id.toString(), work);
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/sub/image", async (req, res) => {
  req.user.img = req.body.img;
  await req.user.save();
  const token = req.user.tokens[req.user.tokens.length - 1].token;
  sendSub(req.user, token, res);
});

router.post("/sub/notifications/clear", (req, res) => {
  clearNotifications(req.user);
});

module.exports = router;
