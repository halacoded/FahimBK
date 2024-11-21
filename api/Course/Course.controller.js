const Course = require("../../models/Course");
const User = require("../../models/User");
const CourseReview = require("../../models/CourseReview");
const Major = require("../../models/Major");

exports.createCourse = async (req, res) => {
  try {
    const { name, number, pre, type, major, credit } = req.body;
    const newCourse = new Course({
      name,
      number,
      pre,
      type,
      major,
      credit,
    });
    await newCourse.save();

    // Update Major references
    await Major.updateMany(
      { _id: { $in: major } },
      { $addToSet: { courses: newCourse._id } }
    );

    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating course", error: error.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate([
      { path: "pre", select: "name number" },
      { path: "major", select: "name" },
      // { path: "users", select: "username" },
      // { path: "courseReviews", select: "" },
    ]);
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate([
      { path: "pre", select: "name number" },
      { path: "major", select: "name" },
      // { path: "users", select: "username" },
      // { path: "courseReviews", select: "" },
    ]);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    // Check if all provided pre courses exist
    if (req.body.pre && req.body.pre.length > 0) {
      const preCourses = await Course.find({ _id: { $in: req.body.pre } });
      if (preCourses.length !== req.body.pre.length) {
        return res
          .status(404)
          .json({ message: "One or more prerequisite courses not found" });
      }
    }

    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("pre major users courseReviews");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update users references
    if (req.body.users) {
      await User.updateMany(
        { _id: { $in: req.body.users } },
        { $addToSet: { courses: course._id } }
      );
    }

    // Update course reviews references
    if (req.body.courseReviews) {
      await CourseReview.updateMany(
        { _id: { $in: req.body.courseReviews } },
        { $addToSet: { course: course._id } }
      );
    }
    //Update Major references
    if (req.body.major) {
      await Major.updateMany(
        { _id: { $in: req.body.major } },
        { $addToSet: { courses: course._id } }
      );
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    // Update other courses to remove course from their pre
    await Course.updateMany(
      { _id: { $in: course.pre } },
      { $pull: { pre: course._id } }
    );
    // Update users references
    await User.updateMany(
      { _id: { $in: course.users } },
      { $pull: { courses: course._id } }
    );

    // Update course reviews references
    await CourseReview.updateMany(
      { _id: { $in: course.courseReviews } },
      { $pull: { course: course._id } }
    );
    //Update Major references

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
