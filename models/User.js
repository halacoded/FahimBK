const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "" },
  major: { type: Schema.Types.ObjectId, ref: "Major" },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }], // Courses user Already Took
  creditDone: { type: Number },
  coursesReviewed: [{ type: Schema.Types.ObjectId, ref: "CourseReview" }],
  ProfessorsReviewed: [{ type: Schema.Types.ObjectId, ref: "ProfessorReview" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("User", UserSchema);
