const School = require("../../Models/school");
const Substitute = require("../../Models/substitute");
const { sendSub, sendSchool } = require("../methods/methods");

const signin = async (req, res, type) => {
  const modelType = type === "sub" ? Substitute : School;
  try {
    const user = await modelType.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    if (type === "sub") {
      const sub = user;
      sendSub(sub, true, token, res);
    } else {
      const school = user;
      sendSchool(school, true, token, res);
    }
  } catch (error) {
    res.status(400).send(error);
  }
};
module.exports = signin;
