const CourseReview = require("../../models/CourseReview");
const Comment = require("../../models/Comment");
const ProfessorReview = require("../../models/ProfessorReview");
const Course = require("../../models/Course");
exports.createCourseReview = async (req, res, next) => {
  try {
    const { course, professor } = req.body;

    const newCourseReview = new CourseReview({
      course,
      professor,
    });

    // // Calculate average rating
    // const sum = ratings.reduce((acc, { rating }) => acc + rating, 0);
    // newCourseReview.avgRating = (sum / ratings.length).toFixed(1);

    await newCourseReview.save();

    // Update Professor Review references
    await ProfessorReview.findByIdAndUpdate(professor, {
      $addToSet: { courses: newCourseReview._id },
    });
    // Update Course references
    await Course.findByIdAndUpdate(course, {
      $addToSet: { courseReviews: newCourseReview._id },
    });
    res.status(201).json({
      message: "Course review created successfully",
      courseReview: newCourseReview,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCourseReviews = async (req, res, next) => {
  try {
    const courseReviews = await CourseReview.find()
      .populate("course", "name number")
      .populate("professor", "name profileImage")
      .populate("ratings.user", "username")
      .populate("comments");

    res.status(200).json(courseReviews);
  } catch (error) {
    next(error);
  }
};

exports.getCourseReviewById = async (req, res, next) => {
  try {
    const courseReview = await CourseReview.findById(req.params.id)
      .populate("course", "name number")
      .populate("professor", "name profileImage")
      .populate("ratings.user", "username")
      .populate("comments");

    if (!courseReview) {
      return res.status(404).json({ message: "Course review not found" });
    }

    res.status(200).json(courseReview);
  } catch (error) {
    next(error);
  }
};

exports.updateCourseReview = async (req, res, next) => {
  try {
    const { course, professor, ratings } = req.body;

    const courseReview = await CourseReview.findById(req.params.id);
    if (!courseReview) {
      return res.status(404).json({ message: "Course review not found" });
    }

    const oldCourse = courseReview.course;
    const oldProfessor = courseReview.professor;

    courseReview.course = course || courseReview.course;
    courseReview.professor = professor || courseReview.professor;
    courseReview.ratings = ratings || courseReview.ratings;

    // Recalculate average rating
    if (ratings) {
      const sum = ratings.reduce((acc, { rating }) => acc + rating, 0);
      courseReview.avgRating = (sum / ratings.length).toFixed(1);
    }

    await courseReview.save();

    // Update professor Review courses if professor changed
    if (professor && professor !== oldProfessor) {
      await ProfessorReview.findByIdAndUpdate(oldProfessor, {
        $pull: { courses: courseReview._id },
      });
      await ProfessorReview.findByIdAndUpdate(professor, {
        $addToSet: { courses: courseReview._id },
      });
    }

    // Update course Review references if course changed
    if (course && course !== oldCourse) {
      await Course.findByIdAndUpdate(oldCourse, {
        $pull: { courseReviews: courseReview._id },
      });
      await Course.findByIdAndUpdate(course, {
        $addToSet: { courseReviews: courseReview._id },
      });
    }

    res
      .status(200)
      .json({ message: "Course review updated successfully", courseReview });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourseReview = async (req, res, next) => {
  try {
    const courseReview = await CourseReview.findByIdAndDelete(req.params.id);
    if (!courseReview) {
      return res.status(404).json({ message: "Course review not found" });
    }

    // Remove Professor Review references
    await ProfessorReview.findByIdAndUpdate(courseReview.professor, {
      $pull: { courses: courseReview._id },
    });

    // Remove Course references
    await Course.findByIdAndUpdate(courseReview.course, {
      $pull: { courseReviews: courseReview._id },
    });

    // Remove all comments related to this course review
    await Comment.deleteMany({ _id: { $in: courseReview.comments } });

    res.status(200).json({ message: "Course review deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.addCourseRating = async (req, res, next) => {
  try {
    const { courseReviewId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    const courseReview = await CourseReview.findById(courseReviewId);
    if (!courseReview) {
      return res.status(404).json({ message: "Course review not found" });
    }

    const existingRating = courseReview.ratings.find(
      (r) => r.user.toString() === userId.toString()
    );
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      courseReview.ratings.push({ user: userId, rating });
    }

    await courseReview.save();

    const sum = courseReview.ratings.reduce((acc, r) => acc + r.rating, 0);
    courseReview.avgRating = (sum / courseReview.ratings.length).toFixed(1);

    await courseReview.save();

    res.status(200).json({ averageRating: courseReview.avgRating });
  } catch (error) {
    next(error);
  }
};
