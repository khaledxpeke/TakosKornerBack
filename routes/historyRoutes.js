const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const { addHistory, getHistory,getLast10Orders,getCommandNumber,addEmail } = require("../controllers/historyController");

router.route("/").post(addHistory);
router.route("/email").post(addEmail);
router.route("/CommandNumber").post(getCommandNumber);
router.route("/").get(getHistory);
router.route("/10").get(getLast10Orders);

module.exports = router;
