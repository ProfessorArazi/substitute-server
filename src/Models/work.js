const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const workSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
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
    type: String,
    default: "",
  },
});

workSchema.plugin(uniqueValidator);

workSchema.methods.addApply = async function (apply) {
  try {
    this.applied = this.applied.concat({ apply });
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
    console.log(this.applied);
  } catch (e) {
    console.log(e);
  }
};

const Work = mongoose.model("Work", workSchema);

module.exports = Work;
