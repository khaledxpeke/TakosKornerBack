const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
addDrink,
getAllDrinks,
deleteDrink,
getDrinkById,
updateDrink
} = require("../controllers/drinkController");

router.route("/").post(userAuth, addDrink);
router.route("/").get(getAllDrinks);
router.route("/:drinkId").get(getDrinkById);
router.route("/update/:drinkId").put(userAuth, updateDrink);
router.route("/:drinkId").delete(userAuth, deleteDrink);

module.exports = router;
