const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  createType,
  getAllTypes,
  getTypeById,
  updateType,
  deleteType,
} = require("../controllers/typeController");

router.route("/").post(userAuth, createType);
router.route("/").get(getAllTypes);
router.route("/:typeId").get(getTypeById);
router.route("/update/:typeId").put(userAuth, updateType);
router.route("/:typeId").delete(userAuth, deleteType);

module.exports = router;
