const mongoose = require("mongoose");
const validator = require("validator");
const zxcvbn = require("zxcvbn");
const bcrypt = require("bcryptjs");

const {
  generateAuthToken,
  addWork,
  hashPassword,
  updateWork,
} = require("../shared/methods/methods");

const substituteSchema = new mongoose.Schema({
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

  works: [
    {
      work: {
        type: Object,
        required: true,
      },
    },
  ],

  notifications: [String],

  grades: [Number],
  img: { type: String, default: "" },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

substituteSchema.methods.generateAuthToken = async function () {
  return generateAuthToken(this);
};

substituteSchema.methods.addWork = async function (work) {
  addWork(this, work);
};

substituteSchema.methods.updateWork = async function (workId, work) {
  updateWork(this, workId, work);
};

substituteSchema.statics.findByCredentials = async (email, password) => {
  try {
    const substitute = await Substitute.findOne({ email });
    if (!substitute) {
      throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, substitute.password);
    if (!isMatch) {
      throw new Error("Unable to login");
    }
    return substitute;
  } catch (e) {
    return e;
  }
};

substituteSchema.pre("save", async function (next) {
  hashPassword(this);
  next();
});

const Substitute = mongoose.model("Substitute", substituteSchema);

module.exports = Substitute;
