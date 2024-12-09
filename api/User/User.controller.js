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

    const majorFound = await Major.find();

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      major,
      profileImage: "",
    });

    await user.save();
    await Major.findByIdAndUpdate(
      majorFound,
      { $push: { users: user._id } },
      { new: true }
    );
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
      })
      .populate("major", "name");

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
    if (req.file && req.file.path) {
      user.profileImage = req.file.path;
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

    // Handle major update
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

exports.addCourses = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const courseIds = req.body.courseIds;

    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ message: "courseIds should be an array" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let creditAdded = 0;
    for (const courseId of courseIds) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res
          .status(404)
          .json({ message: `Course not found: ${courseId}` });
      }
      if (!user.courses.includes(courseId)) {
        user.courses.push(courseId);
        creditAdded += course.credit || 0; // Ensure credit is a valid number
        course.users.push(userId);
      }
    }

    user.creditDone = (user.creditDone || 0) + creditAdded; // Initialize creditDone to 0 if undefined or null
    await user.save();
    await Course.updateMany(
      { _id: { $in: courseIds } },
      { $addToSet: { users: userId } }
    );

    res.status(200).json({ message: "Courses added successfully", user });
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};

exports.removeCourses = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const courseIds = req.body.courseIds;

    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ message: "courseIds should be an array" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let creditRemoved = 0;
    for (const courseId of courseIds) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res
          .status(404)
          .json({ message: `Course not found: ${courseId}` });
      }
      if (!user.courses.includes(courseId)) {
        return res.status(400).json({
          message: `Course ID ${courseId} is not in the user's courses array`,
        });
      }
      creditRemoved += course.credit || 0; // Ensure credit is a valid number
    }

    user.courses.pull(...courseIds);
    user.creditDone = (user.creditDone || 0) - creditRemoved; // Initialize creditDone to 0 if undefined or null
    await user.save();

    await Course.updateMany(
      { _id: { $in: courseIds } },
      { $pull: { users: userId } }
    );

    res.status(200).json({ message: "Courses removed successfully", user });
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};

// exports.getEligibleCourses = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate("courses");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Retrieve all courses with populated pre and Coreq fields
//     const allCourses = await Course.find().populate([
//       {
//         path: "pre",
//         model: "Course",
//         select: "name number",
//         populate: {
//           path: "pre Coreq",
//           model: "Course",
//           select: "name number",
//         },
//       },
//       {
//         path: "Coreq",
//         model: "Course",
//         select: "name number",
//         populate: {
//           path: "pre Coreq",
//           model: "Course",
//           select: "name number",
//         },
//       },
//     ]);

//     // Filter eligible courses
//     const eligibleCourses = allCourses.filter((course) => {
//       // Check if user has already taken the course
//       if (
//         user.courses.some((takenCourse) => takenCourse._id.equals(course._id))
//       ) {
//         return false;
//       }

//       // Check prerequisites
//       if (course.pre && course.pre.length > 0) {
//         for (let preCourse of course.pre) {
//           if (
//             !user.courses.some((takenCourse) =>
//               takenCourse._id.equals(preCourse._id)
//             )
//           ) {
//             return false;
//           }
//         }
//       }

//       // Check co-requisites
//       if (course.Coreq && course.Coreq.length > 0) {
//         for (let coreqCourse of course.Coreq) {
//           if (
//             !user.courses.some((takenCourse) =>
//               takenCourse._id.equals(coreqCourse._id)
//             )
//           ) {
//             return false;
//           }
//         }
//       }

//       return true;
//     });

//     res.status(200).json(eligibleCourses);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Helper function to find all unique combinations of courses that sum up to a target credit value
function findCourseCombinations(courses, target, start, result, results) {
  if (target === 0) {
    // Sort the combination by course ID to standardize the order
    const combination = [...result].sort((a, b) =>
      a._id.toString().localeCompare(b._id.toString())
    );
    const uniqueKey = combination
      .map((course) => course._id.toString())
      .join(",");
    results.add(uniqueKey);
    return;
  }
  for (let i = start; i < courses.length; i++) {
    if (courses[i].credit <= target) {
      result.push(courses[i]);
      findCourseCombinations(
        courses,
        target - courses[i].credit,
        i + 1,
        result,
        results
      );
      result.pop();
    }
  }
}

// Function to get all unique combinations
function getAllUniqueCombinations(courses, targetCredits) {
  const uniqueCombinations = [];
  for (let target of targetCredits) {
    const results = new Set();
    findCourseCombinations(courses, target, 0, [], results);

    // Convert unique keys back to course combinations
    const courseCombos = Array.from(results).map((key) =>
      key
        .split(",")
        .map((id) => courses.find((course) => course._id.toString() === id))
    );
    uniqueCombinations.push({ target, results: courseCombos });
  }
  return uniqueCombinations;
}
exports.getEligibleCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("courses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve all courses with populated pre and Coreq fields
    const allCourses = await Course.find().populate([
      { path: "pre", select: "name number" },
      { path: "Coreq", select: "name number" },
    ]);

    // Filter eligible courses
    const eligibleCourses = allCourses.filter((course) => {
      // Check if user has already taken the course
      if (
        user.courses.some((takenCourse) => takenCourse._id.equals(course._id))
      ) {
        return false;
      }

      // Check prerequisites
      if (course.pre && course.pre.length > 0) {
        for (let preCourse of course.pre) {
          if (
            !user.courses.some((takenCourse) =>
              takenCourse._id.equals(preCourse._id)
            )
          ) {
            return false;
          }
        }
      }

      // Check co-requisites
      if (course.Coreq && course.Coreq.length > 0) {
        for (let coreqCourse of course.Coreq) {
          if (
            !user.courses.some((takenCourse) =>
              takenCourse._id.equals(coreqCourse._id)
            )
          ) {
            return false;
          }
        }
      }

      return true;
    });

    // Define target credit values
    const targetCredits = [9, 10, 11, 12, 13, 14, 15, 16, 17];

    // Get all unique combinations
    const uniqueCourseCombinations = getAllUniqueCombinations(
      eligibleCourses,
      targetCredits
    );

    res.status(200).json(uniqueCourseCombinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
