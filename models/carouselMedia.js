const mongoose = require("mongoose");

const carouselMediaSchema = new mongoose.Schema({
    fileUrl: { type: String, required: true }, 
    type: { type: String, enum: ['image', 'video'], required: true }, 
    createdAt: { type: Date, default: Date.now }, 
  });
  
  const CarouselMedia = mongoose.model('CarouselMedia', carouselMediaSchema);
  
  module.exports = CarouselMedia;
