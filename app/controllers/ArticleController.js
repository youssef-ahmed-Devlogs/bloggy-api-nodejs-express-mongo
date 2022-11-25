const { default: mongoose } = require("mongoose");
const catchAsync = require("../helpers/catchAsync");
const Article = require("../models/Article");
const multer = require("multer");
const sharp = require("sharp");

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

class ArticleController {
  static uploadImages = upload.array("images", 4);
  static resizeImages = catchAsync(async (req, res, next) => {
    if (!req.files) return next();

    req.body.images = [];

    const arrayOfPromises = req.files.map(async (file, i) => {
      const filename = `article-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(1280, 720)
        .toFormat("jpeg")
        .jpeg({ quality: 60 })
        .toFile(`public/storage/articles/${filename}`);

      req.body.images.push(filename);
    });

    await Promise.all(arrayOfPromises);

    next();
  });

  static get = catchAsync(async (req, res, next) => {
    const searchRgx = new RegExp(req.query.search);
    const filter = {
      $or: [{ title: { $regex: searchRgx, $options: "i" } }],
    };
    // when we go to the /categories/:id/articles
    if (req.params.id)
      filter.categories = mongoose.Types.ObjectId(req.params.id);

    const articles = await Article.find(filter).populate({
      path: "categories",
      select: "title",
    });
    res.status(200).json({
      status: "success",
      results: articles.length,
      data: {
        articles,
      },
    });
  });

  static create = catchAsync(async (req, res, next) => {
    const article = await Article.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        article,
      },
    });
  });

  static getOne = catchAsync(async (req, res, next) => {
    const article = await Article.findById(req.params.id).populate({
      path: "categories",
      select: "title",
    });
    res.status(200).json({
      status: "success",
      data: {
        article,
      },
    });
  });

  static update = catchAsync(async (req, res, next) => {
    console.log("====================================");
    console.log(req.files);
    console.log("====================================");
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        article,
      },
    });
  });

  static delete = catchAsync(async (req, res, next) => {
    await Article.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
}

module.exports = ArticleController;
