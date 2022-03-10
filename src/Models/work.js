const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    trim: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
      }
    },
  },
  date: {
    type: Date,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  ageGroup: {
    type: Number,
    required: true,
    validate(value) {
      if (value < 1 || value > 3) {
        throw new Error("wrong group");
      }
    },
  },
  city: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
      }
    },
  },
  school: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
      }
    },
  },

  phone: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length !== 10) {
        throw new Error("invalid phone");
      }
    },
  },
  applied: [
    {
      apply: {
        type: Object,
      },
    },
  ],
  taken: {
    type: Object,
    default: {
      _id: "",
    },
  },

  grade: {
    type: Number,
  },
});

workSchema.methods.addApply = async function (apply) {
  const grade = {};
  grade.votes = apply.grades.length;
  grade.grade =
    grade.votes === 0
      ? 0
      : grade.votes === 1
      ? apply.grades[0]
      : apply.grades.reduce((a, b) => a + b) / grade.votes;
  try {
    this.applied = this.applied.concat({
      apply: {
        city: apply.city,
        email: apply.email,
        name: apply.name,
        phone: apply.phone,
        _id: apply._id,
        img: apply.img,
        grades: grade,
      },
    });
    await this.save();
  } catch (e) {
    console.log(e);
  }
};

workSchema.methods.updateApply = async function (id, apply) {
  try {
    this.applied.splice(
      [this.applied.findIndex((x) => x.apply._id.toString() === id)],
      1,
      { apply }
    );
    await this.save();
  } catch (e) {
    console.log(e);
  }
};

const Work = mongoose.model("Work", workSchema);

module.exports = Work;
