# Fahim Backend

**Fahim** is a recommendation website designed specifically for students at Kuwait University’s College of Engineering and Petroleum. The backend supports functionalities for recommending courses, providing reviews from other students, and helping students choose the best professors.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Technologies Used](#technologies-used)
6. [Contributing](#contributing)
7. [Frontend Repository](#frontend-repository)
8. [Website](#website)

## Introduction

This project aims to assist students at Kuwait University’s College of Engineering and Petroleum in making informed decisions about their course selections and professors for upcoming semesters.

## Features

- **Course Recommendations**: Personalized course suggestions for students.
- **Professor Reviews**: Insights from fellow students about professors and their teaching styles.
- **Course Reviews**: Detailed reviews of courses from students who have previously taken them.

## Installation

To set up the backend on your local machine, follow these steps:

1. **Fork the Repository**:
   Go to the repository on GitHub and click the "Fork" button.

2. **Clone the Forked Repository**:
   ```bash
   git clone git@github.com:halacoded/FahimBK.git
   cd fahim-backend
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the root directory with the following variables:
   ```bash
   MONGO_DB_URL="<your-mongo-db-url>"
   PORT=8000
   JWT_SECRET="<your-jwt-secret>"
   ```

5. **Run the Server**:
   ```bash
   npm start
   ```

## Usage

After setting up, the backend server should be running on `http://localhost:8000`. Use tools like Postman or `curl` to interact with the API.

## Technologies Used

- **Node.js**
- **Express**
- **MongoDB**
- **JWT (for authentication)**

## Contributing

We welcome contributions! Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## Frontend and Data Repositories

The frontend and data for the Fahim project can be found in these repositories:

Frontend Repository [Frontend Repository Link](https://github.com/Gaurav-Janjvadiya/Fahim-Client)]

Data Repository [Frontend Repository Link](https://github.com/Gaurav-Janjvadiya/Fahim-Client)]

## Website

You can visit the Fahim website here:
[Fahim Website](https://gaurav-and-hala-s-fahim.netlify.app/)
