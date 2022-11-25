const User = require("../models/User");
const catchAsync = require("../helpers/catchAsync");
const multer = require("multer");
const sharp = require("sharp");

// ==== Save on memory as a buffer ====
// will not define req.file.filename so we have to define it in resizeUserPhoto() method/middleware
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

class UserController {
  static uploadPhoto = upload.single("photo");
  static resizePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.auth.id}-${Date.now()}.jpeg`;
    req.body.photo = req.file.filename;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/storage/users/${req.file.filename}`);

    next();
  });

  static get = catchAsync(async (req, res, next) => {
    const searchRgx = new RegExp(req.query.search); // => /search/
    const users = await User.find({
      $or: [
        { name: { $regex: searchRgx, $options: "i" } },
        { email: { $regex: searchRgx, $options: "i" } },
      ],
    }); // i stand for case insensitive a = A

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  });

  static create = catchAsync(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  });

  static getOne = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  });

  static update = catchAsync(async (req, res, next) => {
    // We need to update all data but the password
    req.body.password = undefined;
    req.body.passwordConfirm = undefined;
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  });

  static delete = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
}

module.exports = UserController;
