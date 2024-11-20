//imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const passport = require("passport");
const path = require("path");
const {
  localStrategy,
  jwtStrategy,
  JwtStrategy,
} = require("./middleware/passport.js");
const connectDB = require("./database.js");
const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler.js");
//Router
const usersRouter = require("./api/User/User.router.js");
const courseRouter = require("./api/Course/Course.router.js");
//init
const PORT = process.env.PORT || 80000;
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
passport.use("local", localStrategy);
passport.use("jwt", JwtStrategy);

// MongoDB connection
connectDB();

// Routes
app.use("/api/users", usersRouter);
app.use("/api/courses", courseRouter);
app.use("/media", express.static(path.join(__dirname, "media")));
// Not Found Handling middleware

app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
