const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
    createNoIngredient,
    addNoIngredientToProduct,
    getNoIngrediantByProduct,
    getNoIngredients,
    deleteNoIngredient,
} = require("../controllers/NoIngredientController");

router.route("/").post(userAuth, createNoIngredient);
router.route("/add/:productId").post(userAuth, addNoIngredientToProduct);
router.route("/").get(getNoIngredients);
router.route("/prod/:productId").get(getNoIngrediantByProduct);
router.route("/:NoingrediantId").delete(userAuth, deleteNoIngredient);

module.exports = router;
