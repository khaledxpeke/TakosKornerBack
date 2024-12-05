const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  getAllCurrencies,
  getSettings,
  addSettings,
  updateDefaultCurrency,
} = require("../controllers/currencyController");

router.route("/currency").get(userAuth, getAllCurrencies);
router.route("/").get(userAuth, getSettings);
router.route("/add").post(userAuth, addSettings);
router.route("/currency/update").put(userAuth, updateDefaultCurrency);

module.exports = router;
