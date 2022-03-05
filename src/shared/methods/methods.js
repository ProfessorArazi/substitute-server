const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Work = require("../../Models/work");

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

const sendSub = async (sub, sign, token, res) => {
  const now = new Date();
  let works;
  if (sign) {
    works = await Work.find({ date: { $gte: now }, taken: { _id: "" } });

    works = works.filter(
      (work) =>
        !work.applied.find(
          (apply) => apply.apply._id.toString() === sub._id.toString()
        )
    );
  }

  const finalWorks = [];
  sub.works.forEach((work) => {
    let obj = {};
    obj.ageGroup = work.work.ageGroup;
    obj.city = work.work.city;
    obj.date = work.work.date;
    obj.hours = work.work.hours;
    obj.phone = work.work.taken === sub._id.toString() ? work.work.phone : "";
    obj.school = work.work.school;
    obj.subject = work.work.subject;
    obj.taken = work.work.taken;
    obj.userId = work.work.userId;
    obj._id = work.work._id;
    finalWorks.push(obj);
  });

  const grade = {};
  grade.votes = sub.grades.length;
  grade.grade =
    grade.votes === 0
      ? 0
      : grade.votes === 1
      ? sub.grades[0]
      : sub.grades.reduce((a, b) => a + b) / grade.votes;

  let response;

  if (sign) {
    response = {
      sub: {
        sub: {
          _id: sub._id,
          city: sub.city,
          email: sub.email,
          name: sub.name,
          notifications: sub.notifications,
          phone: sub.phone,
          works: finalWorks,
          grade: grade,
        },
        token,
        works,
        type: "sub",
      },
    };
  } else {
    response = {
      sub: {
        _id: sub._id,
        city: sub.city,
        email: sub.email,
        name: sub.name,
        notifications: sub.notifications,
        phone: sub.phone,
        works: finalWorks,
        grade: grade,
      },
      token,
      works,
      type: "sub",
    };
  }

  res.send(response);
};

const sendSchool = async (school, sign, token, res) => {
  let response;

  if (sign) {
    response = {
      school: {
        school: {
          ageGroup: school.ageGroup,
          city: school.city,
          name: school.name,
          notifications: school.notifications,
          phone: school.phone,
          works: school.works,
          id: school.id,
          email: school.email,
        },
        token,
        type: "school",
      },
    };
  } else {
    response = {
      school: {
        ageGroup: school.ageGroup,
        city: school.city,
        name: school.name,
        notifications: school.notifications,
        phone: school.phone,
        works: school.works,
        id: school.id,
        email: school.email,
      },
      token,
      type: "school",
    };
  }

  res.send(response);
};

module.exports = {
  addWork,
  deleteWork,
  generateAuthToken,
  hashPassword,
  updateWork,
  sendSub,
  sendSchool,
};
