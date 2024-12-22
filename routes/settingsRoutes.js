const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  getAllCurrencies,
  getSettings,
  addSettings,
  updateDefaultCurrency,
  deleteCurrency,
  updateCurrencyOrTva,
  uploadLogo,
  uploadBanner,
} = require("../controllers/settingsController");

router.route("/currency").get(userAuth, getAllCurrencies);
router.route("/").get(getSettings);
router.route("/").post(userAuth, addSettings);
router.route("/logo").post(userAuth, uploadLogo);
router.route("/banner").post(userAuth, uploadBanner);
router.route("/currency").delete(deleteCurrency);
router.route("/currency").put(userAuth, updateDefaultCurrency);
router.route("/").put(userAuth, updateCurrencyOrTva);


module.exports = router;
