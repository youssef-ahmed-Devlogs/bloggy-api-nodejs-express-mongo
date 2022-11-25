const Comment = require("../models/Comment");
const catchAsync = require("../helpers/catchAsync");
const { default: mongoose } = require("mongoose");

class CommentController {
  static get = catchAsync(async (req, res, next) => {
    const filter = {};
    // when we go to the /articles/:id/comments
    if (req.params.id) filter.article = req.params.id;

    const comments = await Comment.find(filter);
    res.status(200).json({
      status: "success",
      results: comments.length,
      data: {
        comments,
      },
    });
  });

  static create = catchAsync(async (req, res, next) => {
    const comment = await Comment.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        comment,
      },
    });
  });

  static getOne = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        comment,
      },
    });
  });

  static update = catchAsync(async (req, res, next) => {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        comment,
      },
    });
  });

  static delete = catchAsync(async (req, res, next) => {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
}

module.exports = CommentController;
