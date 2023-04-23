const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  addIngrediant,
  getIngredientsByType,
  updateIngrediant
} = require("../controllers/ingrediantController");

router.route("/:productId").post(userAuth, addIngrediant);
router.route("/:productId/ingrediants/:typeId").get(getIngredientsByType);
router.route("/:id").post(userAuth, updateIngrediant);


module.exports = router;
