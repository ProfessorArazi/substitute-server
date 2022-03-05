const express = require("express");
const School = require("../Models/school");
const router = new express.Router();
const Substitute = require("../Models/substitute");
const Work = require("../Models/work");
const { sendSub } = require("../shared/methods/methods");

router.post("/sub/works/apply", async (req, res) => {
  const sub = req.user;
  try {
    const work = await Work.findById(req.body.workId);
    await work.addApply(sub);
    await sub.addWork(work);
    const school = await School.findById(work.userId);
    await school.updateWork(req.body.workId, work);
    const token = await sub.generateAuthToken();
    sendSub(sub, false, token, res);
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

    sendSub(sub, false, token, res);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
