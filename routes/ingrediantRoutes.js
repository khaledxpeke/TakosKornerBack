const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  createIngredient,
  addIngrediantToProduct,
  getIngredientsByType,
  updateIngrediant,
  getIngrediantByProduct,
  deleteIngredient,
} = require("../controllers/ingrediantController");

router.route("/").post(userAuth, createIngredient);
router.route("/add/:productId").post(userAuth, addIngrediantToProduct);
router.route("/:productId/ingrediants/:typeId").get(getIngredientsByType);
router.route("/prod/:productId").get(getIngrediantByProduct);
router.route("/:id").post(userAuth, updateIngrediant);
router.route("/:ingrediantId").delete(userAuth, deleteIngredient);


module.exports = router;
