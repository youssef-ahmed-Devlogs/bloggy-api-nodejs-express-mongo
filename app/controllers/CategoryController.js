const catchAsync = require("../helpers/catchAsync");
const Category = require("../models/Category");

class CategoryController {
  static get = catchAsync(async (req, res, next) => {
    const searchRgx = new RegExp(req.query.search);
    const categories = await Category.find({
      $or: [{ title: { $regex: searchRgx, $options: "i" } }],
    });
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories,
      },
    });
  });

  static create = catchAsync(async (req, res, next) => {
    const category = await Category.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    });
  });

  static getOne = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  });

  static update = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  });

  static delete = catchAsync(async (req, res, next) => {
    await Category.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
}

module.exports = CategoryController;
