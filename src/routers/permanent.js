const express = require("express");
const router = new express.Router();
const Permanent = require("../Models/permanent");
const Substitute = require("../Models/substitute");
const Work = require("../Models/work");

router.post("/permanents", async (req, res) => {
  const permanent = new Permanent(req.body);
  try {
    await permanent.save();
    const token = await permanent.generateAuthToken();
    res.status(201).send({
      permanent,
      token,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/permanents/login", async (req, res) => {
  try {
    const permanent = await Permanent.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await permanent.generateAuthToken();
    res.send({
      permanent,
      token,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/permanents/work", async (req, res) => {
  const work = new Work(req.body);
  const id = work.userId;
  try {
    await work.save();
    const permanent = await Permanent.findById(id);
    await permanent.addWork(work);
    res.send({ message: "good" });
  } catch (error) {
    console.log(error);
  }
});

router.get("/permanents/works/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const permanent = await Permanent.findById(id);
    res.send({ works: permanent.works });
  } catch (error) {
    console.log(error);
  }
});

router.put("/permanents", async (req, res) => {
  try {
    const permanent = await Permanent.findOneAndUpdate(
      req.body.id,
      req.body.changes,
      { new: true }
    );
    res.send(permanent);
  } catch (error) {
    console.log(error);
  }
});

router.put("/permanents/works", async (req, res) => {
  const permanent = await Permanent.findById(req.body.userId);
  try {
    const work = await Work.findOneAndUpdate(req.body.id, req.body.changes, {
      new: true,
    });
    await permanent.updateWork((req.body.id, work));
    res.send({ work });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/permanents/works/:userId/:id", async (req, res) => {
  const permanent = await Permanent.findById(req.params.userId);
  try {
    await Work.deleteOne({ id: req.params.id });
    await permanent.deleteWork(req.params.id);
    res.send({ message: "delete" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/permanents/works/pick", async (req, res) => {
  // workId,permanentId,pickedTeacherId,...unpickedIds
  // לחשוב על תיקונים
  const work = await Work.findById(req.body[0]);
  try {
    work.taken = req.body[2];
    await work.save();
    const permanent = await Permanent.findById(req.body[1]);
    await permanent.updateWork(req.body[0], work);
    for (let i = 2; i < req.body.length; i++) {
      const substitute = await Substitute.findById(req.body[i]);
      await substitute.updateWork(req.body[0], work);
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
