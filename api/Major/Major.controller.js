const Course = require("../../models/Course");
const User = require("../../models/User");
const ProfessorReview = require("../../models/ProfessorReview");
const Major = require("../../models/Major");

exports.createMajor = async (req, res) => {
  const major = new Major({
    name: req.body.name,
    credits: req.body.credits,
    year: req.body.year,
    courses: req.body.courses,
    users: req.body.users,
    professors: req.body.professors,
  });
  try {
    const newMajor = await major.save();

    // Add major reference to courses
    if (req.body.courses) {
      await Course.updateMany(
        { _id: { $in: req.body.courses } },
        { $addToSet: { major: newMajor._id } }
      );
    }
    // Add major reference to users
    if (req.body.users) {
      await User.updateMany(
        { _id: { $in: req.body.users } },
        { $addToSet: { major: newMajor._id } }
      );
    }
    // Add major reference to professors
    if (req.body.professors) {
      await ProfessorReview.updateMany(
        { _id: { $in: req.body.professors } },
        { $addToSet: { department: newMajor._id } }
      );
    }

    res.status(201).json(newMajor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMajors = async (req, res) => {
  try {
    const majors = await Major.find()
      .populate({
        path: "courses",
        select: "name number type pre  Coreq",
      })
      .populate("users professors");
    res.status(200).json(majors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getMajorById = async (req, res) => {
  try {
    const major = await Major.findById(req.params.id).populate({
      path: "courses",
      select: "name number type",
    });

    if (!major) {
      return res.status(404).json({ message: "Cannot find major" });
    }
    res.status(200).json(major);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMajor = async (req, res) => {
  try {
    const major = await Major.findById(req.params.id);
    if (!major) {
      return res.status(404).json({ message: "Cannot find major" });
    }

    if (req.body.name != null) {
      major.name = req.body.name;
    }
    if (req.body.credits != null) {
      major.credits = req.body.credits;
    }
    if (req.body.year != null) {
      major.year = req.body.year;
    }
    if (req.body.courses != null) {
      major.courses = req.body.courses;
    }
    if (req.body.users != null) {
      major.users = req.body.users;
    }
    if (req.body.professors != null) {
      major.professors = req.body.professors;
    }

    const updatedMajor = await major.save();
    // Add major reference to courses
    if (req.body.courses) {
      await Course.updateMany(
        { _id: { $in: req.body.courses } },
        { $addToSet: { major: major._id } }
      );
    }
    // Add major reference to users
    if (req.body.users) {
      await User.updateMany(
        { _id: { $in: req.body.users } },
        { $addToSet: { major: major._id } }
      );
    }
    // Add major reference to professors
    if (req.body.professors) {
      await ProfessorReview.updateMany(
        { _id: { $in: req.body.professors } },
        { $addToSet: { department: major._id } }
      );
    }
    res.status(200).json(updatedMajor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMajor = async (req, res) => {
  try {
    const major = await Major.findByIdAndDelete(req.params.id);

    if (!major) {
      return res.status(404).json({ message: "Major not found" });
    }

    await Course.updateMany(
      { major: req.params.id },
      { $pull: { major: req.params.id } }
    );

    await User.updateMany(
      { major: req.params.id },
      { $pull: { major: req.params.id } }
    );

    await ProfessorReview.updateMany(
      { department: req.params.id },
      { $pull: { department: req.params.id } }
    );

    res.status(200).json({ message: "Major deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMajorCourses = async (req, res, next) => {
  try {
    console.log("getMajorCourses function called");
    const userId = req.user._id;

    const user = await User.findById(userId).populate("major");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const majorId = user.major?._id;
    if (!majorId) {
      return res.status(404).json({ message: "Major not found for the user" });
    }

    const major = await Major.findById(majorId).populate("courses");
    if (!major) {
      return res.status(404).json({ message: "Major not found" });
    }

    res.status(200).json({ courses: major.courses });
  } catch (err) {
    console.log("Error:", err);
    next(err);
  }
};
