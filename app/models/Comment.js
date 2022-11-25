const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Content field is required."],
  },
  article: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Comment = mongoose.model("Comment", schema);
module.exports = Comment;
