const express = require("express");
const path = require("path");
const CarouselMedia = require("../models/carouselMedia");
const app = express();
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");
const fs = require("fs");

const upload = multer({ storage: multerStorage });

const uploadDir = path.resolve(__dirname, "../uploads/carousel");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
exports.addCarouselMedia = async (req, res) => {
  upload.single("fileUrl")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    if (!req.file) {
      return res.status(400).json({
        message: "Ajouter une image",
        error: "Please upload an image",
      });
    }
    try {
      const { type } = req.body;

      if (!["image", "video"].includes(type)) {
        return res
          .status(400)
          .json({ message: "Invalid file type. Must be image or video." });
      }

      const newMedia = new CarouselMedia({
        fileUrl: `/uploads/carousel/${req.file.filename}`,
        type,
      });

      await newMedia.save();

      res.status(201).json(
        newMedia
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error uploading file" });
    }
  });
};

exports.getCarouselMedia = async (req, res) => {
  try {
    const media = await CarouselMedia.find().sort({ position: 1 });
    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ message: "Error fetching media" });
  }
};

exports.deleteCarouselMedia = async (req, res) => {
  try {
    const { id } = req.params; 


    const media = await CarouselMedia.findById(id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const filePath = path.join(__dirname, "..", "uploads", "carousel", media.fileUrl.split('/').pop());


    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); 
    } else {
      console.error("File not found:", filePath);
    }

    await CarouselMedia.findByIdAndDelete(id);

    res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting media" });
  }
};