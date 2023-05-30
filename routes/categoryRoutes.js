const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.route("/").post(userAuth, createCategory);
router.route("/").get(getAllCategories);
router.route("/:categoryId").get(getCategoryById);
router.route("/update/categoryId").post(userAuth, updateCategory);
router.route("/:categoryId").delete(userAuth, deleteCategory);

module.exports = router;
