const express = require("express");
const filterCourseReviewRoute = express.Router();
const {
  getCourseReviewByCourse,
  getCourseReviewByProfessor,
  getCourseReviewByMostRated,
  getCourseReviewByLowestRated,
} = require("./CourseReviewFilter.controler");

filterCourseReviewRoute.get("/course/:courseId", getCourseReviewByCourse);
filterCourseReviewRoute.get(
  "/professor/:professorId",
  getCourseReviewByProfessor
);
filterCourseReviewRoute.get("/most-rated", getCourseReviewByMostRated);
filterCourseReviewRoute.get("/lowest-rated", getCourseReviewByLowestRated);

module.exports = filterCourseReviewRoute;
