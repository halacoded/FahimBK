const express = require("express");
const courseRouter = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("./Course.controller");
const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

courseRouter.post("/", authenticate, createCourse);
courseRouter.get("/", getCourses);
courseRouter.get("/:id", getCourseById);
courseRouter.put("/:id", authenticate, updateCourse);
courseRouter.delete("/:id", authenticate, deleteCourse);

module.exports = courseRouter;
