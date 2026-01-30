const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
      profilePicture: {
    type: String,
    default: "default-profile.png",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
