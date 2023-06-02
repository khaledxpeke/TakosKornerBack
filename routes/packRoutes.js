const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  addPack,
  getPacks,
  getPackById,
  updatePack,
  deletePack,
} = require("../controllers/packController");

router.route("/").post(userAuth, addPack);
router.route("/").get(getPacks);
router.route("/update/:packId").put(userAuth, updatePack);
router.route("/:packId").delete(userAuth, deletePack);

module.exports = router;
