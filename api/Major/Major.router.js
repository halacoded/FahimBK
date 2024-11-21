const express = require("express");
const majorRouter = express.Router();
const {
  getMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
} = require("./Major.controller");
const passport = require("passport");
const authenticate = passport.authenticate("jwt", { session: false });
// Routes
majorRouter.post("/", authenticate, createMajor);
majorRouter.get("/", getMajors);
majorRouter.get("/:id", getMajorById);
majorRouter.put("/:id", authenticate, updateMajor);
majorRouter.delete("/:id", authenticate, deleteMajor);

module.exports = majorRouter;
