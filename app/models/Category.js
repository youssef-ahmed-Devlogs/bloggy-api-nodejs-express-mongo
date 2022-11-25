const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title field is required."],
    unique: true,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  articles: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Article",
    },
  ],
});

const Category = mongoose.model("Category", schema);
module.exports = Category;
