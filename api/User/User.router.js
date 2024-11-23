const express = require("express");
const usersRouter = express.Router();
const {
  signup,
  signin,
  getAllUsers,
  getMe,
  getUserById,
  updateUser,
} = require("./User.controller");
const passport = require("passport");
const upload = require("../../middleware/multer");

const authenticate = passport.authenticate("jwt", { session: false });

// Authentication routes
usersRouter.post("/signup", signup);
usersRouter.post(
  "/signin",
  passport.authenticate("local", { session: false }),
  signin
);
// User management routes
usersRouter.get("/", authenticate, getAllUsers);
usersRouter.get("/me", authenticate, getMe);
usersRouter.get("/:id", authenticate, getUserById);
usersRouter.put(
  "/:id",
  upload.single("profileImage"),
  authenticate,
  updateUser
);

module.exports = usersRouter;
