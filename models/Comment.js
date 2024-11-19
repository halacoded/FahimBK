const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: { type: Schema.Types.ObjectId, ref: "CourseReview" },
    professor: { type: Schema.Types.ObjectId, ref: "ProfessorReview" },

    content: {
      type: String,
      required: true,
      trim: true,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    commentType: {
      type: String,
      enum: ["course", "professor"],
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient querying of comments by course/professor/ and creation date
commentSchema.index({ course: 1, createdAt: -1 });
commentSchema.index({ professor: 1, createdAt: -1 });

const Comment = model("Comment", commentSchema);

module.exports = Comment;
