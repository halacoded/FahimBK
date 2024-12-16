const Comment = require("../../models/Comment");
const CourseReview = require("../../models/CourseReview");
const ProfessorReview = require("../../models/ProfessorReview");

exports.createComment = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    let newComment;
    if (type === "course") {
      const course = await CourseReview.findById(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      newComment = new Comment({
        user: userId,
        course: id,
        content,
        commentType: "course",
      });
      await CourseReview.findByIdAndUpdate(id, {
        $push: { comments: newComment._id },
      });
    } else if (type === "professor") {
      const professor = await ProfessorReview.findById(id);
      if (!professor) {
        return res.status(404).json({ message: "Professor not found" });
      }
      newComment = new Comment({
        user: userId,
        professor: id,
        content,
        commentType: "professor",
      });
      await ProfessorReview.findByIdAndUpdate(id, {
        $push: { comments: newComment._id },
      });
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all comments for a specific (course or professor) Review post
exports.getComments = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const filter = { parentComment: null };

    if (type === "course") {
      filter.course = id;
    } else if (type === "professor") {
      filter.professor = id;
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    const comments = await Comment.find(filter)
    .sort("-createdAt")
    .populate("user", "username profileImage") // Populate the user of the top-level comment
    .populate({
      path: "replies",
      populate: [
        {
          path: "user", // Populate the user of the first-level replies
          select: "username profileImage",
        },
        {
          path: "replies", // Populate the second-level replies
          populate: {
            path: "user", // Populate the user of the second-level replies
            select: "username profileImage",
          },
        },
      ],
    });  

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);

    // Update the CourseReview or ProfessorReview references
    if (comment.commentType === "course") {
      await CourseReview.findByIdAndUpdate(comment.course, {
        $pull: { comments: commentId },
      });
    } else if (comment.commentType === "professor") {
      await ProfessorReview.findByIdAndUpdate(comment.professor, {
        $pull: { comments: commentId },
      });
    }

    // Also delete all replies to this comment
    await Comment.deleteMany({ parentComment: commentId });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.replyToComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Check if the parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const newReply = new Comment({
      user: userId,
      content,
      parentComment: commentId,
      commentType: parentComment.commentType,
      course: parentComment.course,
      professor: parentComment.professor,
    });

    await newReply.save();

    await Comment.findByIdAndUpdate(commentId, {
      $push: { replies: newReply._id },
    });

    if (parentComment.commentType === "course") {
      await CourseReview.findByIdAndUpdate(parentComment.course, {
        $push: { comments: newReply._id },
      });
    } else if (parentComment.commentType === "professor") {
      await ProfessorReview.findByIdAndUpdate(parentComment.professor, {
        $push: { comments: newReply._id },
      });
    }

    await newReply.populate("user", "username profileImage");

    res.status(201).json(newReply);
  } catch (error) {
    next(error);
  }
};
