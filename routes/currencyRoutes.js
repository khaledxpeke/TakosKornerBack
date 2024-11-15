const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
getAllCurrencies,
addCurrency,
updateDefaultCurrency,
} = require("../controllers/currencyController");

router.route("/").get(userAuth, getAllCurrencies);
router.route("/add").post(userAuth, addCurrency);
router.route("/update").put(userAuth, updateDefaultCurrency);

module.exports = router;
