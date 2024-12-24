const mongoose = require('mongoose');

const carouselMediaSchema = new mongoose.Schema({
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5, // 5 seconds default for images
    required: function() { return this.mediaType === 'image'; }
  },
  order: {
    type: Number,
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: false });

module.exports = mongoose.model('CarouselMedia', carouselMediaSchema);