const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const createError = require("http-errors");

const userModal = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userModal.pre("save", function (next) {
  const user = this;
  const saltRounds = 10;
  bcrypt.hash(user.password, saltRounds).then(function (hash) {
    user.password = hash;
    next();
  });
});
userModal.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);
  return compare;
};

const User = mongoose.model("User", userModal);
module.exports = { User };
