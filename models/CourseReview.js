const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CourseReviewSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    professor: {
      type: Schema.Types.ObjectId,
      ref: "ProfessorReview",
      required: true,
    },
    ratings: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    avgRating: { type: Number, default: 0 },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CourseReview", CourseReviewSchema);
