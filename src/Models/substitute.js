const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
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

substituteSchema.plugin(uniqueValidator);

substituteSchema.methods.generateAuthToken = async function () {
  generateAuthToken(this);
};

substituteSchema.methods.addWork = async function (work) {
  addWork(this, work);
};

substituteSchema.methods.updateWork = async function (work) {
  updateWork(this, work);
};

// substituteSchema.methods.deleteWork = async function (id) {
//   try {
//     this.works = this.works.filter((x) => x.work._id.toString() !== id);
//     await this.save();
//   } catch (e) {
//     console.log(e);
//   }
// };

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
