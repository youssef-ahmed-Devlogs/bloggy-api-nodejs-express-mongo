const express = require("express");
const app = require("../../app");
const router = express.Router();
const articlesRoutes = require("./articles");
const CategoryController = require("../../app/controllers/CategoryController");

router.use("/:id/articles", articlesRoutes);

router.route("/").get(CategoryController.get).post(CategoryController.create);

router
  .route("/:id")
  .get(CategoryController.getOne)
  .patch(CategoryController.update)
  .delete(CategoryController.delete);

module.exports = router;
