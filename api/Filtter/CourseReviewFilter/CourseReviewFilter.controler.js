const Course = require("../../../models/Course");
const CourseReview = require("../../../models/CourseReview");
const ProfessorReview = require("../../../models/ProfessorReview");
const getCourseReviewByCourse = async (req, res) => {
  try {
    const reviews = await CourseReview.find({ course: req.params.courseId })
      .populate("course")
      .populate("professor")
      .populate("ratings.user")
      .populate("comments");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseReviewByProfessor = async (req, res) => {
  try {
    const reviews = await CourseReview.find({
      professor: req.params.professorId,
    })
      .populate("course")
      .populate("professor")
      .populate("ratings.user")
      .populate("comments");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseReviewByMostRated = async (req, res) => {
  try {
    const reviews = await CourseReview.find()
      .sort({ avgRating: -1 })
      .limit(10)
      .populate("course")
      .populate("professor")
      .populate("ratings.user")
      .populate("comments");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseReviewByLowestRated = async (req, res) => {
  try {
    const reviews = await CourseReview.find()
      .sort({ avgRating: 1 })
      .limit(10)
      .populate("course")
      .populate("professor")
      .populate("ratings.user")
      .populate("comments");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourseReviewByCourse,
  getCourseReviewByProfessor,
  getCourseReviewByMostRated,
  getCourseReviewByLowestRated,
};
