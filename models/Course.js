const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CourseSchema = new Schema({
  name: { type: String, required: true },
  number: { type: Number, required: true },
  pre: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  type: { type: String, required: true },
  major: { type: Schema.Types.ObjectId, ref: "Major" }, // required: true
  credit: { type: Number, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  courseReviews: [{ type: Schema.Types.ObjectId, ref: "CourseReview" }],
});

module.exports = mongoose.model("Course", CourseSchema);
