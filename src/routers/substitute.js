const express = require("express");
const School = require("../Models/school");
const router = new express.Router();
const Substitute = require("../Models/substitute");
const Work = require("../Models/work");

router.get("/works", async (req, res) => {
  const works = await Work.find();
  res.status(201).send({ works });
});

router.post("/substitutes", async (req, res) => {
  const substitute = new Substitute(req.body);
  try {
    await substitute.save();
    const token = await substitute.generateAuthToken();
    res.status(201).send({
      substitute,
      token,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/substitute/login", async (req, res) => {
  try {
    const substitute = await Substitute.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await substitute.generateAuthToken();
    res.send({
      substitute,
      token,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/substitutes/works/apply", async (req, res) => {
  const substitute = await Substitute.findById(req.body.substituteId);
  try {
    const work = await Work.findById(req.body.workId);
    await work.addApply(substitute);
    await substitute.addWork(work);
    const school = await School.findById(work.userId);
    await school.updateWork(req.body.workId, work);
    res.send({ message: "added" });
  } catch (error) {
    console.log(error);
  }
});

router.put("/substitutes", async (req, res) => {
  try {
    const substitute = await Substitute.findOneAndUpdate(
      req.body.id,
      req.body.changes,
      { new: true }
    );
    for (let i = 0; i < substitute.works.length; i++) {
      const work = await Work.findById(substitute.works[i].work.id.toString());
      await work.updateApply(req.body.id, substitute);
      const school = await School.findById(work.userId);
      school.updateWork(work.id.toString(), work);
    }

    res.send(substitute);
  } catch (error) {
    console.log(error);
  }
});

router.get("/substitutes/works/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const substitute = await Substitute.findById(id);

    // ריצה על כל העבודות ובדיקה האם המשתמש קיבל את העבודה ולא להחזיר את האיי די של מי שקיבל

    res.send({ works: substitute.works });
  } catch (error) {
    console.log(error);
  }
});

// router.delete("/substitutes/works/:userId/:id", async (req, res) => {
//   const substitute = await Substitute.findById(req.params.userId);
//   try {
//     await Work.deleteOne({ id: req.params.id });
//     await substitute.deleteWork(req.params.id);
//     res.send({ message: "delete" });
//   } catch (error) {
//     console.log(error);
//   }
// });

module.exports = router;
