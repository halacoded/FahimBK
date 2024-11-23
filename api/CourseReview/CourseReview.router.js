const express = require("express");
const courseReviewRouter = express.Router();
const {
  createCourseReview,
  getCourseReviews,
  getCourseReviewById,
  updateCourseReview,
  deleteCourseReview,
  addCourseRating,
} = require("./CourseReview.controller");
const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

courseReviewRouter.post("/", authenticate, createCourseReview);
courseReviewRouter.get("/", getCourseReviews);
courseReviewRouter.get("/:id", getCourseReviewById);
courseReviewRouter.put("/:id", authenticate, updateCourseReview);
courseReviewRouter.delete("/:id", authenticate, deleteCourseReview);
courseReviewRouter.post("/:courseReviewId/rate", authenticate, addCourseRating);

module.exports = courseReviewRouter;
