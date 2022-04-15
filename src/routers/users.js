const express = require("express");
const router = new express.Router();
const signin = require("../shared/users/signin");
const signup = require("../shared/users/signup");
const Substitute = require("../Models/substitute");
const School = require("../Models/school");

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
