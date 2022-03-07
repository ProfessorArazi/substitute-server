const express = require("express");
const School = require("../Models/school");
const router = new express.Router();
const Substitute = require("../Models/substitute");
const Work = require("../Models/work");
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

router.post("/sub/works/apply", async (req, res) => {
  const sub = req.user;
  try {
    const work = await Work.findById(req.body.workId);
    await work.addApply(sub);
    await sub.addWork(work);
    const school = await School.findById(work.userId);
    school.notifications.push("מישהו הציע את עצמו לאחת העבודות שפרסמת");
    await school.updateWork(req.body.workId, work);
    const token = await sub.generateAuthToken();
    sendSub(sub, token, res);
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
    for (let i = 0; i < sub.works.length; i++) {
      const work = await Work.findById(sub.works[i].work.id.toString());
      await work.updateApply(req.body.id, sub);
      const school = await School.findById(work.userId);
      school.updateWork(work.id.toString(), work);
    }

    const token = await sub.generateAuthToken();

    sendSub(sub, token, res);
  } catch (error) {
    console.log(error);
  }
});

router.post("/sub/notifications/clear", (req, res) => {
  clearNotifications(req.user);
});

module.exports = router;
