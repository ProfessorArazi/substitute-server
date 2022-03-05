const School = require("../../Models/school");
const Substitute = require("../../Models/substitute");

const signup = async (req, res, type) => {
  let modelType = type === "sub" ? Substitute : School;

  const user = new modelType(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    if (type === "sub") {
      res.status(201).send({
        sub: {
          _id: user._id,
          city: user.city,
          email: user.email,
          name: user.name,
          notifications: user.notifications,
          phone: user.phone,
          works: user.works,
        },
        token,
        type: "sub",
      });
    } else {
      res.status(201).send({
        school: {
          _id: user._id,
          city: user.city,
          email: user.email,
          name: user.name,
          notifications: user.notifications,
          phone: user.phone,
          works: user.works,
        },
        token,
        type: "school",
      });
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports = signup;
