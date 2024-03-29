const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  createIngredient,
  addIngrediantToProduct,
  getIngredientsByType,
  updateIngrediant,
  getIngrediantByProduct,
  deleteIngredient,
  getAllIngrediants,
  getAllIngrediantsByType,
} = require("../controllers/ingrediantController");

router.route("/").post(userAuth, createIngredient);
router.route("/add/:productId").post(userAuth, addIngrediantToProduct);
router.route("/:productId/ingrediants/:typeId").get(getIngredientsByType);
router.route("/").get(getAllIngrediants);
router.route("/ingrediants").get(getAllIngrediantsByType);
router.route("/prod/:productId").get(getIngrediantByProduct);
router.route("/update/:ingrediantId").put(userAuth, updateIngrediant);
router.route("/:ingrediantId").delete(userAuth, deleteIngredient);


module.exports = router;
