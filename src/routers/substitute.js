const express = require("express");
const School = require("../Models/school");
const router = new express.Router();
const Substitute = require("../Models/substitute");
const Work = require("../Models/work");

router.get("/works/:id", async (req, res) => {
  const now = new Date();
  let works = await Work.find({ date: { $gte: now }, taken: "" });

  if (req.params.id !== "!") {
    works = works.filter(
      (work) =>
        !work.applied.find(
          (apply) => apply.apply._id.toString() === req.params.id
        )
    );
  }

  res.status(201).send({ works });
});

router.post("/sub", async (req, res) => {
  const sub = new Substitute(req.body);
  try {
    await sub.save();
    const token = await sub.generateAuthToken();
    res.status(201).send({
      sub: {
        _id: sub._id,
        city: sub.city,
        email: sub.email,
        name: sub.name,
        notifications: sub.notifications,
        phone: sub.phone,
        works: sub.works,
      },
      token,
      type: "sub",
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/sub/login", async (req, res) => {
  try {
    const sub = await Substitute.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await sub.generateAuthToken();

    const now = new Date();
    let works = await Work.find({ date: { $gte: now }, taken: "" });

    works = works.filter(
      (work) =>
        !work.applied.find(
          (apply) => apply.apply._id.toString() === sub._id.toString()
        )
    );

    res.send({
      sub: {
        sub: {
          _id: sub._id,
          city: sub.city,
          email: sub.email,
          name: sub.name,
          notifications: sub.notifications,
          phone: sub.phone,
          works: sub.works,
        },
        token,
        works,
        type: "sub",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.post("/sub/works/apply", async (req, res) => {
  const substitute = await Substitute.findById(req.body.substituteId);
  try {
    const work = await Work.findById(req.body.workId);
    await work.addApply(substitute);
    await substitute.addWork(work);
    const school = await School.findById(work.userId);
    await school.updateWork(req.body.workId, work);
    const token = await substitute.generateAuthToken();
    res.send({
      sub: {
        _id: substitute._id,

        city: substitute.city,
        email: substitute.email,
        name: substitute.name,
        notifications: substitute.notifications,
        phone: substitute.phone,
        works: substitute.works,
      },
      token,
      type: "sub",
    });
  } catch (error) {
    console.log(error);
  }
});

router.put("/sub", async (req, res) => {
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

router.get("/sub/works/:id", async (req, res) => {
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
