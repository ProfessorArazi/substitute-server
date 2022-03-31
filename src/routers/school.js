const express = require("express");
const router = new express.Router();
const Substitute = require("../Models/substitute");
const Work = require("../Models/work");
const mailSender = require("../shared/mailSender/mailSender");
const { sendSchool, clearNotifications } = require("../shared/methods/methods");

let newWorks = [];

const generateMailingList = async () => {
  let works = await Work.find({ _id: newWorks, taken: { _id: "" } }).select(
    "city -_id"
  );
  const counts = {};
  for (const work of works) {
    counts[work.city] = counts[work.city]
      ? { amount: counts[work.city] + 1, emails: [] }
      : { amount: 1, emails: [] };
  }
  const users = await Substitute.find({
    city: Object.keys(counts),
    mailingList: true,
  }).select({
    city: 1,
    email: 1,
    _id: 0,
  });
  users.forEach((user) => counts[user.city].emails.push(user.email));
  const mails = Object.values(counts);
  mails.forEach((mail) =>
    mailSender(mail.emails, `נוספו עוד ${mail.amount} עבודות בעיר שלך`)
  );
  newWorks = [];
};

setInterval(() => {
  generateMailingList();
}, 86400000);

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
    newWorks.push(work._id);
  } catch (error) {
    console.log(error);
  }
});

router.put("/school", async (req, res) => {
  const changes = Object.entries(req.body.changes);
  try {
    changes.forEach((change) => (req.user[change[0]] = change[1]));
    await req.user.save();
    const token = req.user.tokens[req.user.tokens.length - 1].token;

    sendSchool(req.user, token, res);
    await Work.updateMany(
      { userId: req.user._id },
      { ...req.body.changes, school: req.body.changes.name }
    );
  } catch (error) {
    console.log(error);
  }
});

router.put("/school/work", async (req, res) => {
  const school = req.user;
  try {
    const work = school.works.find(
      (work) => work.work._id.toString() === req.body.id
    ).work;
    const changesArr = Object.entries(req.body.changes);
    changesArr.forEach((change) => (work[change[0]] = change[1]));
    await school.updateWork(req.body.id, work);
    const token = school.tokens[school.tokens.length - 1].token;
    sendSchool(school, token, res);
    await Work.findOneAndUpdate(req.body.id, req.body.changes);

    if (work.applied && work.applied.length > 0) {
      const appliers = await Substitute.find({
        _id: work.applied.map((apply) => apply.apply._id),
      });
      for (let i = 0; i < appliers.length; i++) {
        appliers[i].notifications.push(
          `העבודה בתאריך ${work.date} נערכה על ידי ${work.school}`
        );
        await appliers[i].updateWork(req.body.id, work);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/school/works/:userId/:id", async (req, res) => {
  const school = req.user;
  try {
    const work = await Work.findById(req.params.id);

    await Work.deleteOne({ _id: req.params.id });

    await school.deleteWork(req.params.id);
    const token = school.tokens[school.tokens.length - 1].token;
    sendSchool(school, token, res);

    if (work.applied && work.applied.length > 0) {
      const appliers = await Substitute.find({
        _id: work.applied.map((apply) => apply.apply._id),
      });
      for (let i = 0; i < appliers.length; i++) {
        appliers[i].notifications.push(
          `העבודה בתאריך ${work.date} נמחקה על ידי ${work.school}`
        );
        await appliers[i].deleteWork(req.params.id);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/school/works/pick", async (req, res) => {
  const { workId, pickedTeacherId } = req.body;

  const work = await Work.findById(workId);
  if (
    !work.applied.find(
      (apply) => apply.apply._id.toString() === pickedTeacherId
    )
  ) {
    return res.send({ error: "משהו השתבש, נסה לרענן את הדף..." });
  }
  try {
    const sub = await Substitute.findById(pickedTeacherId);
    work.taken = sub;
    const school = req.user;
    await school.updateWork(workId, { ...work, applied: [] });

    const token = school.tokens[school.tokens.length - 1].token;
    sendSchool(school, token, res);
    for (let i = 0; i < work.applied.length; i++) {
      const substitute = await Substitute.findById(
        work.applied[i].apply._id.toString()
      );
      if (sub._id.toString() === substitute._id.toString()) {
        substitute.notifications.push("קיבלת את העבודה");
      }
      await substitute.updateWork(workId, {
        _id: work._id,
        userId: work.userId,
        subject: work.subject,
        date: work.date,
        ageGroup: work.ageGroup,
        city: work.city,
        hours: work.hours,
        school: work.school,
        phone: work.phone,
        taken: { _id: sub._id },
      });
    }
    await Work.deleteOne({ _id: workId });
    if (sub.mailingList) {
      mailSender(sub.email, "קיבלת את העבודה");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/school/rate", async (req, res) => {
  const { workId, subId, grade } = req.body;
  const school = req.user;
  const work = school.works.find(
    (work) => work.work._id.toString() === workId
  ).work;
  if (!work.grade) {
    work.grade = +grade;
    await school.updateWork(workId, work);
    const token = school.tokens[school.tokens.length - 1].token;

    sendSchool(school, token, res);
    const sub = await Substitute.findById(subId);
    sub.grades = sub.grades.concat(grade);
    sub.notifications.push("קיבלת דירוג חדש");
    await sub.save();
    if (sub.mailingList) {
      mailSender(sub.email, "קיבלת דירוג חדש");
    }
  }
});

router.post("/school/notifications/clear", (req, res) => {
  clearNotifications(req.user);
});

module.exports = router;
