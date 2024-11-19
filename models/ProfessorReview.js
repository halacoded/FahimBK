const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ProfessorReviewSchema = new Schema(
  {
    name: { type: String, required: true },
    profileImage: { type: String, default: "" },
    department: { type: Schema.Types.ObjectId, ref: "Major", required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: "CourseReview" }],
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

module.exports = mongoose.model("ProfessorReview", ProfessorReviewSchema);
