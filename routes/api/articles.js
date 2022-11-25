const express = require("express");
const router = express.Router({ mergeParams: true });
const commentsRoutes = require("./comments");
const ArticleController = require("../../app/controllers/ArticleController");

router.use("/:id/comments", commentsRoutes);

router.route("/").get(ArticleController.get).post(ArticleController.create);
router
  .route("/:id")
  .get(ArticleController.getOne)
  .patch(
    ArticleController.uploadImages,
    ArticleController.resizeImages,
    ArticleController.update
  )
  .delete(ArticleController.delete);

module.exports = router;
