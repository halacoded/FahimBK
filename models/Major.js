const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const MajorSchema = new Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  year: { type: Number, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  professors: [{ type: Schema.Types.ObjectId, ref: "ProfessorReview" }],
});

module.exports = mongoose.model("Major", MajorSchema);
