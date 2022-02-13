const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
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

const permanentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
      }
    },
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
      },
    },
  ],

  notifications: [
    {
      notification: {
        type: String,
      },
    },
  ],

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

permanentSchema.plugin(uniqueValidator);
permanentSchema.methods.generateAuthToken = async function () {
  generateAuthToken(this);
};

permanentSchema.methods.addWork = async function (work) {
  addWork(this, work);
};

permanentSchema.methods.updateWork = async function (id, work) {
  updateWork(this, id, work);
};

permanentSchema.methods.deleteWork = async function (id) {
  deleteWork(this, id);
};

permanentSchema.statics.findByCredentials = async (email, password) => {
  try {
    const permanent = await Permanent.findOne({ email });

    if (!permanent) {
      throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, permanent.password);
    if (!isMatch) {
      throw new Error("Unable to login");
    }
    return permanent;
  } catch (e) {
    return e;
  }
};

permanentSchema.pre("save", async function (next) {
  hashPassword(this);
  next();
});

const Permanent = mongoose.model("Permanent", permanentSchema);

module.exports = Permanent;
