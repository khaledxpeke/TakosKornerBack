const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  addIngrediant,
  getIngredientsByType,
  updateIngrediant,
  getIngrediantByProduct
} = require("../controllers/ingrediantController");

router.route("/").post(userAuth, addIngrediant);
router.route("/:productId/ingrediants/:typeId").get(getIngredientsByType);
router.route("/prod/:productId").get(getIngrediantByProduct);
router.route("/:id").post(userAuth, updateIngrediant);


module.exports = router;
