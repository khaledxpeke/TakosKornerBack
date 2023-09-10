const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const { addHistory, getHistory,getLast10Orders,getCommandNumber } = require("../controllers/historyController");

router.route("/").post(addHistory);
router.route("/CommandNumber").post(getCommandNumber);
router.route("/").get(getHistory);
router.route("/10").get(getLast10Orders);

module.exports = router;
