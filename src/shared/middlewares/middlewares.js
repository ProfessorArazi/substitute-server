const Substitute = require("../../Models/substitute");
const School = require("../../Models/school");

const isAuthenticated = async (req, res, next) => {
  const token = req.headers.token;
  const { email, substituteId, userId, type } = req.body;
  const modelType = type === "sub" ? Substitute : School;
  try {
    const user = await modelType.findById(substituteId || userId);
    if (user.email !== email) throw new Error("wrong cradentials");
    if (!user.tokens.find((item) => item.token === token))
      throw new Error("wrong cradentials");
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send({ error: "unauthenticated" });
  }
};

module.exports = { isAuthenticated };
