//imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./database.js");

//init
const PORT = process.env.PORT || 80000;
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// MongoDB connection
connectDB();

// Routes

// Not Found Handling middleware

// Error handling middleware

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
