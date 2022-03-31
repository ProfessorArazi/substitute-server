const School = require("../../Models/school");
const Substitute = require("../../Models/substitute");
const fs = require("fs");
const path = require("path");
const resizeImg = require("resize-img");

const { sendSub, sendSchool } = require("../methods/methods");

const signup = async (req, res, type) => {
  let modelType = type === "sub" ? Substitute : School;
  const body = JSON.parse(req.body.state);
  const obj = {};

  if (req.file) {
    obj.name = req.file.filename;
    obj.img = {
      data: await resizeImg(
        fs.readFileSync(
          path.join(__dirname + "/../../../files/" + req.file.filename)
        ),
        { width: 200 }
      ),
      contentType: "image/png",
    };
    body.img = obj;
  }

  const user = new modelType(body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    if (type === "sub") {
      sendSub(user, token, res);
    } else {
      sendSchool(user, token, res);
    }
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports = signup;
