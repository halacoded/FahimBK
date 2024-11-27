const express = require("express");
const filterProfessorRoute = express.Router();
const {
  getProfessorsByTitle,
  getProfessorsByDepartment,
  getMostRatedProfessors,
  getLowestRatedProfessors,
} = require("./Filter.controller");

filterProfessorRoute.get("/title/:title", getProfessorsByTitle);
filterProfessorRoute.get(
  "/department/:departmentId",
  getProfessorsByDepartment
);
filterProfessorRoute.get("/most-rated", getMostRatedProfessors);
filterProfessorRoute.get("/lowest-rated", getLowestRatedProfessors);

module.exports = filterProfessorRoute;
