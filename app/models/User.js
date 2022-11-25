const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name field is required."],
    minlength: 8,
  },
  email: {
    type: String,
    required: [true, "Email field is required."],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Email field must be a valid email."],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Password field is required."],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Password Confirm field is required."],
    validate: {
      // This only works on create() and save()
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

schema.pre("save", async function (next) {
  /**
   * This because the password will be changed in two cases
   * case1 ) when modify the password in Model.create() from empty to new password
   * case2 ) when modify the password in model.save() from old to new password
   * and we only want to encrypt the password if it changed
   */
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

schema.pre("save", function (next) {
  /**
   * will run only if the password updated and not the first password
   */
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

schema.methods.checkPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

schema.methods.checkIfPasswordChange = function (issuedAt) {
  /**
   * issuedAt timestamp is in seconds
   * this.passwordChangedAt.getTime() give to us timestamp in milliseconds
   * so we divide the result by 1000 to convert it to seconds, and then parse it to Int of 10 numbers
   */
  if (this.passwordChangedAt) {
    const convertToTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return convertToTimestamp > issuedAt;
  }

  return false;
};

const User = mongoose.model("User", schema);
module.exports = User;
