const catchAsync = require("../helpers/catchAsync");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // 90d
  }); // 90d - 10h - 5m  - 3s
};

class AuthController {
  static register = catchAsync(async (req, res, next) => {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken({ id: user._id });

    res.status(201).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  });

  static login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email) {
      return next(new Error("Email field can't be empty."));
    }
    if (!password) {
      return next(new Error("Password field can't be empty."));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new Error("This email is not exist. Please register first!"));
    }

    const check = await user.checkPassword(password, user.password);
    if (!check) {
      return next(new Error("Password is incorrect."));
    }

    const token = signToken({ id: user._id });

    res.status(200).json({
      status: "success",
      token,
    });
  });

  static resetPassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  });

  static auth = (...roles) => {
    return catchAsync(async (req, res, next) => {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return next(
          new Error("You are not logged in! Please login to get access.")
        );
      }

      /**
       * We used here promisify() method in order to make jwt.verify() method return promise
       * because jwt.verify() work in callback way (err, value) => {} and we need to work in async-await way
       */
      const decodedPayload = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decodedPayload.id);

      if (!user) {
        return next(
          new Error("The user belonging to this token doesn't exist.")
        );
      }

      if (user.checkIfPasswordChange(decodedPayload.iat)) {
        return next(
          Error("User recently changed password! Please login again.")
        );
      }

      req.auth = {
        user,
        id: user._id,
        role: user.role,
      };

      // Check user roles
      roles = roles.length ? roles : ["user"];
      if (!roles.includes(req.auth.role)) {
        return next(new Error("You don't have permissions."));
      }

      next();
    });
  };
}

module.exports = AuthController;
