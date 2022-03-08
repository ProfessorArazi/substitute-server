const express = require("express");
const router = new express.Router();
const School = require("../Models/school");
const Substitute = require("../Models/substitute");
const Work = require("../Models/work");
const mailSender = require("../shared/mailSender/mailSender");
const { sendSchool, clearNotifications } = require("../shared/methods/methods");

router.post("/school/works", async (req, res) => {
  const token = req.user.tokens[req.user.tokens.length - 1].token;
  sendSchool(req.user, token, res);
});

router.post("/school/work", async (req, res) => {
  const work = new Work(req.body);
  try {
    await work.save();
    const school = req.user;
    await school.addWork(work);
    const token = school.tokens[school.tokens.length - 1].token;

    sendSchool(school, token, res);
  } catch (error) {
    console.log(error);
  }
});

router.put("/school", async (req, res) => {
  try {
    const school = await School.findOneAndUpdate(
      req.body.id,
      req.body.changes,
      { new: true }
    );
    const token = school.tokens[school.tokens.length - 1].token;

    sendSchool(school, token, res);
  } catch (error) {
    console.log(error);
  }
});

router.put("/school/work", async (req, res) => {
  const school = req.user;
  try {
    const work = await Work.findOneAndUpdate(req.body.id, req.body.changes, {
      new: true,
    });
    await work.set("taken", { _id: "" });
    await work.set("applied", undefined);
    await work.save();
    await school.updateWork(req.body.id, work);
    const token = school.tokens[school.tokens.length - 1].token;

    sendSchool(school, token, res);
  } catch (error) {
    console.log(error);
  }
});

router.post("/school/works/:userId/:id", async (req, res) => {
  const school = req.user;
  try {
    await Work.deleteOne({ id: req.params.id });

    await school.deleteWork(req.params.id);
    const token = school.tokens[school.tokens.length - 1].token;
    sendSchool(school, token, res);
  } catch (error) {
    console.log(error);
  }
});

router.post("/school/works/pick", async (req, res) => {
  const { workId, pickedTeacherId } = req.body;

  const work = await Work.findById(workId);
  try {
    const sub = await Substitute.findById(pickedTeacherId);
    work.taken = sub;
    await work.save();
    const school = req.user;
    await school.updateWork(workId, work);

    const token = school.tokens[school.tokens.length - 1].token;
    sendSchool(school, token, res);
    for (let i = 0; i < work.applied.length; i++) {
      const substitute = await Substitute.findById(
        work.applied[i].apply._id.toString()
      );
      if (sub._id.toString() === substitute._id.toString()) {
        substitute.notifications.push("קיבלת את העבודה");
      }
      await substitute.updateWork(workId, work);
    }
    await Work.deleteOne({ _id: workId });
    mailSender(sub.email, "קיבלת את העבודה");
  } catch (error) {
    console.log(error);
  }
});

router.post("/school/rate", async (req, res) => {
  const { workId, subId, grade } = req.body;
  const school = req.user;
  const work = await Work.findById(workId);
  if (!work.grade) {
    work.grade = +grade;
    await work.save();
    await school.updateWork(workId, work);
    const token = school.tokens[school.tokens.length - 1].token;

    sendSchool(school, token, res);
    const sub = await Substitute.findById(subId);
    sub.grades = sub.grades.concat(grade);
    sub.notifications.push("קיבלת דירוג חדש");
    await sub.save();
    mailSender(sub.email, "קיבלת דירוג חדש");
  }
});

router.post("/school/notifications/clear", (req, res) => {
  clearNotifications(req.user);
});

module.exports = router;
