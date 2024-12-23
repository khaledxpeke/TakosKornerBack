const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  getAllCurrencies,
  getSettings,
  addSettings,
  updateDefaultCurrency,
  deleteCurrency,
  uploadLogo,
  uploadBanner,
  updateSettings,
} = require("../controllers/settingsController");

router.route("/currency").get(userAuth, getAllCurrencies);
router.route("/").get(getSettings);
router.route("/").post(userAuth, addSettings);
router.route("/currency").delete(deleteCurrency);
router.route("/currency").put(userAuth, updateDefaultCurrency);
router.route("/").put(userAuth, updateSettings);


module.exports = router;
