const mongoose = require("mongoose");
const validator = require("validator");
const zxcvbn = require("zxcvbn");
const bcrypt = require("bcryptjs");
const {
  generateAuthToken,
  addWork,
  deleteWork,
  hashPassword,
  updateWork,
} = require("../shared/methods/methods");

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
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

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("email is invalid");
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
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
    validate(value) {
      if (zxcvbn(value).score < 2) {
        throw new Error("invalid password");
      }
    },
  },

  ageGroup: {
    type: String,
    required: true,
  },

  works: [
    {
      work: {
        type: Object,
      },
    },
  ],

  notifications: [String],

  img: { type: String, default: "" },

  mailingList: { type: Boolean, default: false },

  demo: { type: Boolean, default: false },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

schoolSchema.methods.generateAuthToken = async function () {
  return generateAuthToken(this);
};

schoolSchema.methods.addWork = async function (work) {
  addWork(this, work);
};

schoolSchema.methods.updateWork = async function (id, work) {
  updateWork(this, id, work);
};

schoolSchema.methods.deleteWork = async function (id) {
  deleteWork(this, id);
};

schoolSchema.statics.findByCredentials = async (email, password) => {
  try {
    const school = await School.findOne({ email });

    if (!school) {
      throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, school.password);
    if (!isMatch) {
      throw new Error("Unable to login");
    }
    return school;
  } catch (e) {
    return e;
  }
};

schoolSchema.pre("save", async function (next) {
  hashPassword(this);
  next();
});

const School = mongoose.model("School", schoolSchema);

module.exports = School;
