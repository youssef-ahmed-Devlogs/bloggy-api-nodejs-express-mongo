const express = require("express");
const router = express.Router({ mergeParams: true });
const CommentController = require("../../app/controllers/CommentController");

router.route("/").get(CommentController.get).post(CommentController.create);
router
  .route("/:id")
  .get(CommentController.getOne)
  .patch(CommentController.update)
  .delete(CommentController.delete);

module.exports = router;
