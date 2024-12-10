const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CourseSchema = new Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  pre: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  Coreq: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  reqCredit: { type: Number, default: 0 },
  weight: { type: Number },
  type: { type: String, required: true }, //  "general_education_requirement", "core_requirement", etc.
  major: [{ type: Schema.Types.ObjectId, ref: "Major" }], //Course can be in one or more Major
  credit: { type: Number, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  courseReviews: [{ type: Schema.Types.ObjectId, ref: "CourseReview" }],
});

module.exports = mongoose.model("Course", CourseSchema);
