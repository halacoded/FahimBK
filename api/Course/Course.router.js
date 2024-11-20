const express = require("express");
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("./Course.controller");
const passport = require("passport");

const authenticate = passport.authenticate("jwt", { session: false });
const courseRouter = express.Router();

courseRouter.post("/", authenticate, createCourse);
courseRouter.get("/", getCourses);
courseRouter.get("/:id", getCourseById);
courseRouter.put("/:id", authenticate, updateCourse);
courseRouter.delete("/:id", authenticate, deleteCourse);

module.exports = courseRouter;
