const express = require("express");
const router = new express.Router();
const signin = require("../shared/users/signin");
const signup = require("../shared/users/signup");
const Substitute = require("../Models/substitute");
const School = require("../Models/school");
const upload = require("../shared/upload/upload");
const fs = require("fs");
const path = require("path");
const resizeImg = require("resize-img");

const { updateProfile, sendSub } = require("../shared/methods/methods");

const deleteDemosFromDb = async () => {
  await Substitute.deleteMany({ demo: true });
  await School.deleteMany({ demo: true });
};

setInterval(deleteDemosFromDb, 86400000); // run at night

router.post("/sub", upload.single("files"), (req, res) => {
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

router.put("/sub/image", upload.single("files"), async (req, res) => {
  const image = {
    name: req.file.filename,
    img: {
      data: await resizeImg(
        fs.readFileSync(
          path.join(__dirname + "/../../files/" + req.file.filename)
        ),
        { width: 200 }
      ),
      contentType: "image/png",
    },
  };
  const user = await Substitute.findByIdAndUpdate(
    JSON.parse(req.body.state).substituteId,
    {
      img: image,
    },
    { new: true }
  );
  try {
    const token = user.tokens[user.tokens.length - 1].token;
    sendSub(user, token, res);
    const userIds = user.works.map((work) => work.work.userId);
    const schools = await School.find({ _id: userIds }).select("works");
    updateProfile(user, schools, Object.entries({ img: image }));
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
