const router = require("express").Router();
const {
  register,
  login,
  getUsers,
  logout,
  getUserbyId,
} = require("../controllers/userController");
const { userAuth } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/users").get(getUsers);
router.route("/user").get(userAuth, getUserbyId);
router.route("/logout").post(logout);

module.exports = router;
