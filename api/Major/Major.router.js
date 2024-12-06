const express = require("express");
const majorRouter = express.Router();
const {
  getMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
  getMajorCourses,
} = require("./Major.controller");
const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });

majorRouter.post("/", authenticate, createMajor);
majorRouter.get("/", getMajors);
majorRouter.get("/:id", getMajorById);
majorRouter.put("/:id", authenticate, updateMajor);
majorRouter.delete("/:id", authenticate, deleteMajor);
majorRouter.get("/a/aaa", authenticate, getMajorCourses);
module.exports = majorRouter;
