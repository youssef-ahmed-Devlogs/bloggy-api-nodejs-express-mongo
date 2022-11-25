const express = require("express");
const AuthController = require("../../app/controllers/AuthController");
const router = express.Router();
const UserController = require("../../app/controllers/UserController");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.patch("/resetPassword/:id", AuthController.resetPassword);

// Admin Panel Routes
router.use(AuthController.auth("admin"));
router.route("/").get(UserController.get).post(UserController.create);
router
  .route("/:id")
  .get(UserController.getOne)
  .patch(
    UserController.uploadPhoto,
    UserController.resizePhoto,
    UserController.update
  )
  .delete(UserController.delete);

module.exports = router;
