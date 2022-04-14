const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const {
  generateAuthToken,
  addWork,
  hashPassword,
  updateWork,
  deleteWork,
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

  mailingList: { type: Boolean, default: false },

  desc: { type: String, default: "" },

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

substituteSchema.methods.generateAuthToken = async function () {
  return generateAuthToken(this);
};

substituteSchema.methods.addWork = async function (work) {
  addWork(this, work);
};

substituteSchema.methods.updateWork = async function (workId, work) {
  updateWork(this, workId, work);
};

substituteSchema.methods.deleteWork = async function (id) {
  deleteWork(this, id);
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
