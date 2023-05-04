const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
  addHistory,
  getAllHistory,
  getHistoryById,
  updateHistory,
  deleteHistory,
} = require("../controllers/historyController");

router.route("/").post(addHistory);
router.route("/").get(getAllHistory);
router.route("/:historyId").get(getHistoryById);
router.route("/update/:historyId").post(userAuth, updateHistory);
router.route("/").delete(userAuth, deleteHistory);

module.exports = router;
