const express = require("express");
const commentRouter = express.Router();
const {
  getComments,
  createComment,
  deleteComment,
  replyToComment,
} = require("./Comment.controller");
const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

commentRouter.post("/:type/:id", authenticate, createComment);
// Get all comments for a specific (course or professor) Review post
commentRouter.get("/:type/:id", getComments);
commentRouter.delete("/:commentId", authenticate, deleteComment);
commentRouter.post("/:commentId", authenticate, replyToComment);

module.exports = commentRouter;
