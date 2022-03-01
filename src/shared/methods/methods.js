const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateAuthToken = async (user) => {
  try {
    const token = jwt.sign(
      { _id: user._id.toString() },
      "ilovesoccerandbasketball",
      { expiresIn: "1h" }
    );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
  } catch (e) {
    console.log(e);
  }
};

const addWork = async (user, work) => {
  try {
    user.works = user.works.concat({
      work: {
        _id: work._id,
        userId: work.userId,
        subject: work.subject,
        date: work.date,
        hours: work.hours,
        ageGroup: work.ageGroup,
        city: work.city,
        school: work.school,
        phone: work.phone,
        taken: work.taken,
      },
    });
    await user.save();
  } catch (e) {
    console.log(e);
  }
};

const updateWork = async (user, id, work) => {
  try {
    user.works.splice(
      [user.works.findIndex((x) => x.work._id.toString() === id)],
      1,
      { work }
    );
    await user.save();
  } catch (e) {
    console.log(e);
  }
};

const deleteWork = async (user, id) => {
  try {
    user.works = user.works.filter((x) => x.work._id.toString() !== id);
    await user.save();
  } catch (e) {
    console.log(e);
  }
};

const hashPassword = async (user) => {
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
};

module.exports = {
  addWork,
  deleteWork,
  generateAuthToken,
  hashPassword,
  updateWork,
};
