const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselMediaController');

router.post('/', carouselController.addMedia);
router.get('/', carouselController.getAllMedia);
router.get('/stream', carouselController.getCarouselStream);
router.put('/order', carouselController.updateOrder);
router.delete('/:id', carouselController.deleteMedia);

module.exports = router;