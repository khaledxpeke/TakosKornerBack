const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  createSupplement,
  getAllSupplements,
  getSupplementById,
  getSupplementByProduct,
  addSupplementToProduct,
  deleteSupplement,
  updateSupplement,
} = require("../controllers/supplementController");

router.route("/").post(userAuth, createSupplement);
router.route("/add/:productId").post(userAuth, addSupplementToProduct);
router.route("/").get(getAllSupplements);
router.route("/:supplementId").get(getSupplementById);
router.route("/product/:productId").get(getSupplementByProduct);
router.route("/update/:supplementId").put(userAuth,updateSupplement );
router.route("/:supplementId").delete(userAuth, deleteSupplement);

module.exports = router;
