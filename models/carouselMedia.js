const mongoose = require("mongoose");

const carouselMediaSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  position: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const CarouselMedia = mongoose.model("CarouselMedia", carouselMediaSchema);

module.exports = CarouselMedia;
