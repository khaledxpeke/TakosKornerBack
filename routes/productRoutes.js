const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  addProductToCategory,
  getProductsByCategory,
  deleteProduct,
  updateProduct,
  getAllProducts
} = require("../controllers/productController");

router.route("/:categoryId").post(userAuth,addProductToCategory);
router.route("/:categoryId").get(getProductsByCategory);
router.route("/").get(getAllProducts);
router.route("/update").post(userAuth, updateProduct);
router.route("/").delete(userAuth, deleteProduct);

module.exports = router;
