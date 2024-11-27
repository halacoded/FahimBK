const Course = require("../../../models/Course");
const CourseReview = require("../../../models/CourseReview");
const ProfessorReview = require("../../../models/ProfessorReview");
const Major = require("../../../models/Major");

exports.getProfessorsByTitle = async (req, res) => {
  try {
    const { title } = req.params;
    const professors = await ProfessorReview.find({ title })
      .populate("courses")
      .populate("comments")
      .populate("department");

    res.status(200).json(professors);
  } catch (err) {
    console.error("Get professors by title error:", err);
    res
      .status(500)
      .json({ message: "Error fetching professors", error: err.message });
  }
};

exports.getProfessorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const professors = await ProfessorReview.find({ department: departmentId })
      .populate("courses")
      .populate("comments")
      .populate("department");

    res.status(200).json(professors);
  } catch (err) {
    console.error("Get professors by department error:", err);
    res
      .status(500)
      .json({ message: "Error fetching professors", error: err.message });
  }
};

exports.getMostRatedProfessors = async (req, res) => {
  try {
    const professors = await ProfessorReview.find()
      .sort({ avgRating: -1 })
      .populate("courses")
      .populate("comments")
      .populate("department");

    res.status(200).json(professors);
  } catch (err) {
    console.error("Get most rated professors error:", err);
    res
      .status(500)
      .json({ message: "Error fetching professors", error: err.message });
  }
};

exports.getLowestRatedProfessors = async (req, res) => {
  try {
    const professors = await ProfessorReview.find()
      .sort({ avgRating: 1 })
      .populate("courses")
      .populate("comments")
      .populate("department");

    res.status(200).json(professors);
  } catch (err) {
    console.error("Get lowest rated professors error:", err);
    res
      .status(500)
      .json({ message: "Error fetching professors", error: err.message });
  }
};
