const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  getAllCurrencies,
  getSettings,
  addSettings,
  updateDefaultCurrency,
  deleteCurrency,
} = require("../controllers/settingsController");

router.route("/currency").get(userAuth, getAllCurrencies);
router.route("/").get(userAuth, getSettings);
router.route("/").post(userAuth, addSettings);
router.route("/currency").delete(deleteCurrency);
router.route("/currency").put(userAuth, updateDefaultCurrency);


module.exports = router;
