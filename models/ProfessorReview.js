const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ProfessorReviewSchema = new Schema({
  name: { type: String, required: true },
  title: { type: String, enum: ["Dr.", "Eng."], required: true },
  profileImage: { type: String, default: "" },
  department: { type: Schema.Types.ObjectId, ref: "Major", required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "CourseReview" }],
  ratings: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      teachingQuality: { type: Number, required: true, min: 1, max: 5 },
      flexibility: { type: Number, required: true, min: 1, max: 5 },
      examsHomework: { type: Number, required: true, min: 1, max: 5 },
      classEnjoyment: { type: Number, required: true, min: 1, max: 5 },
      recommendation: { type: Number, required: true, min: 1, max: 5 },
    },
  ],
  avgRating: { type: Number, default: 0 },
  avgTeachingQuality: { type: Number, default: 0 },
  avgFlexibility: { type: Number, default: 0 },
  avgExamsHomework: { type: Number, default: 0 },
  avgClassEnjoyment: { type: Number, default: 0 },
  avgRecommendation: { type: Number, default: 0 },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("ProfessorReview", ProfessorReviewSchema);
