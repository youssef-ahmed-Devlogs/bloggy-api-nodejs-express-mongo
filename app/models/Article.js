const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title field is required."],
    unique: true,
  },
  slug: String,
  description: String,
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Article most belong to a category."],
    },
  ],
});

// Document middleware: I used this to fill slug field before save the document in database
schema.pre("save", function (next) {
  // convert this => "New title Today" to this "new-title-today"
  this.slug = slugify(this.title);
  next();
});

schema.pre(/Update/, async function (next) {
  /**
   * You cannot access the document being updated in pre('updateOne') or pre('findOneAndUpdate') query middleware. If you need to access
   * the document that will be updated, you need to execute an explicit query for the document.
   */
  const currentArticle = await this.model.findOne(this.getQuery());
  // convert this => "New title Today" to this "new-title-today"
  currentArticle.slug = slugify(currentArticle.title);
  currentArticle.save();
  next();
});

function slugify(str, options = null) {
  if (options == null) return str.toLowerCase().split(" ").join("-");
  if (options.lower) str = str.toLowerCase();
  return str.split(" ").join(options.separator);
}

const Article = mongoose.model("Article", schema);
module.exports = Article;
