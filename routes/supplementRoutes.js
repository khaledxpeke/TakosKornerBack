const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  addSupplement,
  getAllSupplements,
  getSupplementById,
  getSupplementByProduct,
  deleteSupplement,
} = require("../controllers/supplementController");

router.route("/").post(userAuth, addSupplement);
router.route("/").get(getAllSupplements);
router.route("/:supplementId").get(getSupplementById);
router.route("/product/:productId").get(getSupplementByProduct);
router.route("/").delete(userAuth, deleteSupplement);

module.exports = router;
