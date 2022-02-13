const express = require("express");
const router = new express.Router();
const School = require("../Models/school");
const Substitute = require("../Models/substitute");
const Work = require("../Models/work");

router.post("/schools", async (req, res) => {
  const school = new School(req.body);
  try {
    await school.save();
    const token = await school.generateAuthToken();
    res.status(201).send({
      school,
      token,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/schools/login", async (req, res) => {
  try {
    const school = await School.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await school.generateAuthToken();
    res.send({
      school,
      token,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/schools/work", async (req, res) => {
  const work = new Work(req.body);
  const id = work.userId;
  try {
    await work.save();
    const school = await School.findById(id);
    await school.addWork(work);
    res.send({ message: "good" });
  } catch (error) {
    console.log(error);
  }
});

router.get("/schools/works/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const school = await School.findById(id);
    res.send({ works: school.works });
  } catch (error) {
    console.log(error);
  }
});

router.put("/schools", async (req, res) => {
  try {
    const school = await School.findOneAndUpdate(
      req.body.id,
      req.body.changes,
      { new: true }
    );
    res.send(school);
  } catch (error) {
    console.log(error);
  }
});

router.put("/schools/works", async (req, res) => {
  const school = await School.findById(req.body.userId);
  try {
    const work = await Work.findOneAndUpdate(req.body.id, req.body.changes, {
      new: true,
    });
    await school.updateWork((req.body.id, work));
    res.send({ work });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/schools/works/:userId/:id", async (req, res) => {
  const school = await School.findById(req.params.userId);
  try {
    await Work.deleteOne({ id: req.params.id });
    await school.deleteWork(req.params.id);
    res.send({ message: "delete" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/schools/works/pick", async (req, res) => {
  // workId,schoolId,pickedTeacherId,...unpickedIds
  // לחשוב על תיקונים
  const work = await Work.findById(req.body[0]);
  try {
    work.taken = req.body[2];
    await work.save();
    const school = await School.findById(req.body[1]);
    await school.updateWork(req.body[0], work);
    for (let i = 2; i < req.body.length; i++) {
      const substitute = await Substitute.findById(req.body[i]);
      await substitute.updateWork(req.body[0], work);
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
