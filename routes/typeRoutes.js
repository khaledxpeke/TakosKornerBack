const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
createType
} = require("../controllers/typeController");

router.route("/").post(userAuth, createType);



module.exports = router;
