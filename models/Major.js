const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const MajorSchema = new Schema(
  {
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    general_education_requirement: [
      { type: Schema.Types.ObjectId, ref: "Course" },
    ],
    general_elective: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    mathematics_and_basic_science_requirement: [
      { type: Schema.Types.ObjectId, ref: "Course" },
    ],
    college_of_engineering_requirement: [
      { type: Schema.Types.ObjectId, ref: "Course" },
    ],
    core_requirement: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    department_electives: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    professors: [{ type: Schema.Types.ObjectId, ref: "ProfessorReview" }],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Major", MajorSchema);
