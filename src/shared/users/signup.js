const School = require("../../Models/school");
const Substitute = require("../../Models/substitute");
const { sendSub, sendSchool } = require("../methods/methods");

const signup = async (req, res, type) => {
  let modelType = type === "sub" ? Substitute : School;

  const user = new modelType(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    if (type === "sub") {
      sendSub(user, token, res);
    } else {
      sendSchool(user, token, res);
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports = signup;
