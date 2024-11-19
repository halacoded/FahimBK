const User = require("../../models/User");
const Major = require("../../models/Major");
const Course = require("../../models/Course");
const CourseReview = require("../../models/CourseReview");
const ProfessorsReviewed = require("../../models/ProfessorReview");

const saltRounds = 10;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
// Authentication
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log({ error: error });
  }
};

const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword, major } = req.body;
    console.log("Received data:", req.body);

    // Check if all required fields are provided
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      return res.status(500).json({ message: "Error hashing password" });
    }

    // const majorFound = await Major.findOne({ name: major });

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      //   major: majorFound._id,
      profileImage: "",
    });

    await user.save();
    // await Major.findByIdAndUpdate(
    //   majorFound._id,
    //   { $push: { users: user._id } },
    //   { new: true }
    // );
    // Generate token for the new user
    const token = generateToken(user);

    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};

exports.signin = async (req, res, next) => {
  try {
    const token = generateToken(req.user);
    return res.status(201).json({ token: token });
  } catch (err) {
    next(err);
  }
};

// User management
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate("major", "name");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "courses",
        select: "name number pre credit major type",
        populate: {
          path: "major",
          select: "name",
        },
      })
      .populate({
        path: "coursesReviewed",
        select: "course professor ratings avgRating comments",
        populate: [
          { path: "course", select: "name number" },
          { path: "professor", select: "name profileImage" },
        ],
      })
      .populate({
        path: "ProfessorsReviewed",
        select: "name ratings avgRating comments",
        populate: {
          path: "department",
          select: "name",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("major", "name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const { username, email, password, major, courseNumbers } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle profile image upload
    if (req.files && req.files.profileImage) {
      user.profileImage = req.files.profileImage[0].path;
    }

    // Handle username update
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.username = username;
    }

    // Handle email update
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    // Handle password update
    if (password) {
      const hashedPassword = await hashPassword(password);
      if (!hashedPassword) {
        return res.status(500).json({ message: "Error hashing password" });
      }
      user.password = hashedPassword;
    }

    // Update major
    if (major) {
      const majorFound = await Major.findOne({ name: major });
      if (majorFound) {
        user.major = majorFound._id;
      } else {
        return res.status(404).json({ message: "Major not found" });
      }
    }

    // Handle courses update by number
    if (courseNumbers && Array.isArray(courseNumbers)) {
      const courses = await Course.find({ number: { $in: courseNumbers } });
      if (courses.length !== courseNumbers.length) {
        return res
          .status(404)
          .json({ message: "One or more courses not found" });
      }
      user.courses = courses.map((course) => course._id);
    }

    await user.save();

    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("courses", "name number pre credit major type")
      .populate("major", "name")
      .populate({
        path: "coursesReviewed",
        select: "course professor ratings avgRating comments",
        populate: [
          { path: "course", select: "name number" },
          { path: "professor", select: "name profileImage" },
        ],
      })
      .populate({
        path: "ProfessorsReviewed",
        select: "name ratings avgRating comments",
        populate: {
          path: "department",
          select: "name",
        },
      });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
};
