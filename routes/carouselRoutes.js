const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
addCarouselMedia,
getCarouselMedia,
deleteCarouselMedia
} = require("../controllers/carouselController");

router.route("/").post(userAuth, addCarouselMedia);
router.route("/").get(userAuth,getCarouselMedia);
router.route("/:id").delete(userAuth,deleteCarouselMedia);

module.exports = router;
