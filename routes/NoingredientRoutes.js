const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
    createNoIngredient,
    addNoIngredientToProduct,
    getNoIngredients,
    updateNoIngrediant,
    deleteNoIngredient,
} = require("../controllers/NoIngredientController");

router.route("/").post(userAuth, createNoIngredient);
router.route("/add/:productId").post(userAuth, addNoIngredientToProduct);
router.route("/").get(getNoIngredients);
router.route("/:id").post(userAuth, updateNoIngrediant);
router.route("/:NoingrediantId").delete(userAuth, deleteNoIngredient);