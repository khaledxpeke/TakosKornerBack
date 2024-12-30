const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
addVariation,
getVariations,
updateVariation,
deleteVariation
} = require("../controllers/variationController");

router.route("/").post(userAuth, addVariation);
router.route("/").get(getVariations);
router.route("/:variationId").put(userAuth, updateVariation);
router.route("/:variationId").delete(userAuth, deleteVariation);

module.exports = router;
