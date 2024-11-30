const router = require("express").Router();
const { userAuth } = require("../middleware/auth");
const {
addCarouselMedia,
getCarouselMedia,
deleteCarouselMedia,
ActivateCarouselMedia,
getActiveCarouselMedia,
reorderCarouselMedia,

} = require("../controllers/carouselController");

router.route("/").post(userAuth, addCarouselMedia);
router.route("/").get(userAuth,getCarouselMedia);
router.route("/active").get(getActiveCarouselMedia);
router.route("/:id").delete(userAuth,deleteCarouselMedia);
router.route("/:id/activate").put(userAuth,  ActivateCarouselMedia);
router.route("/reorder").put(userAuth,  reorderCarouselMedia);

module.exports = router;
