const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const { addHistory, getHistory,getLast10Orders } = require("../controllers/historyController");

router.route("/").post(addHistory);
router.route("/").get(getHistory);
router.route("/10").get(getLast10Orders);

module.exports = router;
