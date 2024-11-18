const User = require("../models/User");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const dotenv = require("dotenv");
dotenv.config();

const localStrategy = new LocalStrategy(
  {
    usernameField: "username",
    passwordField: "password",
  },
  async (username, password, done) => {
    try {
      const foundUser = await User.findOne({ username: username }); //find the user
      if (!foundUser)
        return done({ message: "Username or password incorrect" });
      const isMatch = await bcrypt.compare(password, foundUser.password); //check password
      if (!isMatch) return done({ message: "Username or password incorrect" });
      return done(null, foundUser); //req.user //go to controller if all's good
    } catch (error) {
      return done(error);
    }
  }
);

const JwtStrategy = new JWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (!user) return done({ messsage: "User is not Found" });

      const expiry = new Date(payload.exp * 1000 * 60 * 60 * 24); // It converts the expiration timestamp from the JWT (which is in seconds) to millisecond
      const now = new Date();
      if (now > expiry) return done({ message: "Token expired" });

      return done(null, user); //req.user
    } catch (error) {
      return done(error);
    }
  }
);

module.exports = { localStrategy, JwtStrategy };
