const express = require("express");
const router = new express.Router();
const Work = require("../Models/work");
const signin = require("../shared/users/signin");
const signup = require("../shared/users/signup");

router.get("/works/:id", async (req, res) => {
  const now = new Date();
  let works = await Work.find({ date: { $gte: now }, taken: { _id: "" } });

  works = works.filter(
    (work) =>
      !work.applied.find(
        (apply) => apply.apply._id.toString() === req.params.id
      )
  );

  res.status(201).send({ works });
});

router.post("/sub", (req, res) => {
  signup(req, res, "sub");
});

router.post("/school", (req, res) => {
  signup(req, res, "school");
});

router.post("/sub/login", (req, res) => {
  signin(req, res, "sub");
});

router.post("/school/login", (req, res) => {
  signin(req, res, "school");
});

module.exports = router;
