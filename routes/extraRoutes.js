const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
addExtra,
deleteExtra,
getExtraById,
getExtras,
updateExtra
} = require("../controllers/extraController");

router.route("/").post(userAuth, addExtra);
router.route("/").get(getExtras);
router.route("/update/:extraId").put(userAuth, updateExtra);
router.route("/:extraId").delete(userAuth, deleteExtra);

module.exports = router;
