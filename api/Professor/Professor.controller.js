const ProfessorReview = require("../../models/ProfessorReview");
const User = require("../../models/User");
const CourseReview = require("../../models/CourseReview");
const Major = require("../../models/Major");
const Comment = require("../../models/Comment");
exports.createProfessor = async (req, res) => {
  try {
    const { name, title, department, courses } = req.body;
    const profileImage = req.file ? req.file.path : "";

    const newProfessor = new ProfessorReview({
      name,
      title,
      profileImage,
      department,
      courses,
    });

    await newProfessor.save();

    await CourseReview.updateMany(
      { _id: { $in: courses } },
      { $addToSet: { professor: newProfessor._id } }
    );
    await Major.findByIdAndUpdate(department, {
      $addToSet: { professors: newProfessor._id },
    });

    res.status(201).json({
      message: "Professor created successfully",
      professor: newProfessor,
    });
  } catch (err) {
    console.error("Create professor error:", err);
    res
      .status(500)
      .json({ message: "Error creating professor", error: err.message });
  }
};

exports.getProfessors = async (req, res) => {
  try {
    const professors = await ProfessorReview.find()
      .populate("courses")
      .populate("comments")
      .populate("department");

    res.status(200).json(professors);
  } catch (err) {
    console.error("Get professors error:", err);
    res
      .status(500)
      .json({ message: "Error fetching professors", error: err.message });
  }
};

exports.getProfessorById = async (req, res) => {
  try {
    const professor = await ProfessorReview.findById(req.params.id)
      .populate("courses")
      .populate("department")
      .populate("comments.user", "name");

    if (!professor) {
      return res.status(404).json({ message: "Professor not found" });
    }
    res.status(200).json(professor);
  } catch (err) {
    console.error("Get professor by ID error:", err);
    res
      .status(500)
      .json({ message: "Error fetching professor", error: err.message });
  }
};

exports.updateProfessor = async (req, res) => {
  try {
    const { name, title, department, courses } = req.body;
    const profileImage = req.file ? req.file.path : "";

    const professor = await ProfessorReview.findById(req.params.id);
    if (!professor) {
      return res.status(404).json({ message: "Professor not found" });
    }
    const oldDepartment = professor.department;
    professor.name = name || professor.name;
    professor.title = title || professor.title;
    professor.department = department || professor.department;
    professor.profileImage = profileImage || professor.profileImage;
    professor.courses = courses || professor.courses;

    await professor.save();
    await CourseReview.updateMany(
      { _id: { $in: courses } },
      { $addToSet: { professor: professor._id } }
    );

    if (department && department !== professor.department.toString()) {
      await Major.findByIdAndUpdate(oldDepartment, {
        $pull: { professors: professor._id },
      });
      await Major.findByIdAndUpdate(department, {
        $addToSet: { professors: professor._id },
      });
    }

    res
      .status(200)
      .json({ message: "Professor updated successfully", professor });
  } catch (err) {
    console.error("Update professor error:", err);
    res
      .status(500)
      .json({ message: "Error updating professor", error: err.message });
  }
};

exports.deleteProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProfessor = await ProfessorReview.findByIdAndDelete(id);

    if (!deletedProfessor) {
      return res.status(404).json({ message: "Professor not found" });
    }

    //Remove CourseReview references
    await CourseReview.updateMany(
      { professor: id },
      { $unset: { professor: "" } }
    );
    await Major.findByIdAndUpdate(deletedProfessor.department, {
      $pull: { professors: deletedProfessor._id },
    });

    await Comment.deleteMany({ professor: id });
    res.status(200).json({ message: "Professor deleted successfully" });
  } catch (err) {
    console.error("Delete professor error:", err);
    res
      .status(500)
      .json({ message: "Error deleting professor", error: err.message });
  }
};

exports.addProfessorRating = async (req, res, next) => {
  try {
    const { professorId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    const professor = await ProfessorReview.findById(professorId);
    if (!professor) {
      return res.status(404).json({ message: "Professor not found" });
    }

    const existingRating = professor.ratings.find(
      (r) => r.user.toString() === userId.toString()
    );
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      professor.ratings.push({ user: userId, rating });
    }

    await professor.save();

    const sum = professor.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = (sum / professor.ratings.length).toFixed(1);

    professor.avgRating = averageRating;
    await professor.save();

    res.status(200).json({ averageRating });
  } catch (error) {
    next(error);
  }
};
