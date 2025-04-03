const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    bio: String,
    skills: [String],
    goals: [String],
  },
  progress: {
    coursesCompleted: [String],
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
  },
});

module.exports = mongoose.model("User", UserSchema);
