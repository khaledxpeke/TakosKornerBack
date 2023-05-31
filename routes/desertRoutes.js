const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  addDesert,
  getAllDeserts,
  getDesertById,
  updateDesert,
  deleteDesert,
} = require("../controllers/desertController");

router.route("/").post(userAuth, addDesert);
router.route("/").get(getAllDeserts);
router.route("/:desertId").get(getDesertById);
router.route("/update/:desertId").post(userAuth, updateDesert);
router.route("/:desertId").delete(userAuth, deleteDesert);

module.exports = router;
