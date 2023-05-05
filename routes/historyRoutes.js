const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const { addHistory, getHistory } = require("../controllers/historyController");

router.route("/").post(addHistory);
router.route("/").get(getHistory);

module.exports = router;
