const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  addHistory,
} = require("../controllers/historyController");

router.route("/").post(addHistory);


module.exports = router;
