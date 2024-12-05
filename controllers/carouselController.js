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
  upload.array("fileUrl", 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one image",
        error: "No files were uploaded",
      });
    }
    try {

      const newMediaDocs = req.files.map((file) => ({
        fileUrl: `/uploads/carousel/${file.filename}`,
        isActive: false,
      }));

      const newMedia = await CarouselMedia.insertMany(newMediaDocs);

      res.status(201).json(
        newMedia
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors du téléchargement du fichier" });
    }
  });
};

exports.getCarouselMedia = async (req, res) => {
  try {
    const media = await CarouselMedia.find().sort({ position: 1 });
    if (!media) {
      return res.status(404).json({ message: "Aucun média trouvé" });
    }
    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du média" });
  }
};

exports.ActivateCarouselMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "Valeur « isActive » non valide." });
    }

    const media = await CarouselMedia.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!media) {
      return res.status(404).json({ message: "Aucun média trouvé" });
    }

    res.status(200).json({ message: `Media ${isActive ? "activé" : "désactivé"}`, media });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut du média" });
  }
};

exports.reorderCarouselMedia = async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ message: "La commande doit être un tableau de ID de média." });
    }

    const mediaItems = await CarouselMedia.find({ _id: { $in: order }, isActive: true });

    if (mediaItems.length !== order.length) {
      return res.status(400).json({ message: "Certains identifiants multimédias ne sont pas valides ou inactifs." });
    }

    for (let i = 0; i < order.length; i++) {
      await CarouselMedia.findByIdAndUpdate(order[i], { position: i + 1 });
    }

    res.status(200).json({ message: "Les médias ont été réorganisés avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la réorganisation du média." });
  }
};

exports.getActiveCarouselMedia = async (req, res) => {
  try {
    const activeMedia = await CarouselMedia.find({ isActive: true }).sort({ position: 1 });
    if (!activeMedia) {
      return res.status(404).json({ message: "Aucun média actif trouvé" });
    }
    res.status(200).json(activeMedia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération du média actif." });
  }
};

exports.deleteCarouselMedia = async (req, res) => {
  try {
    const { id } = req.params; 


    const media = await CarouselMedia.findById(id);

    if (!media) {
      return res.status(404).json({ message: "Média non trouvé" });
    }

    const filePath = path.join(__dirname, "..", "uploads", "carousel", media.fileUrl.split('/').pop());


    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); 
    } else {
      console.error("File not found:", filePath);
    }

    await CarouselMedia.findByIdAndDelete(id);

    res.status(200).json({ message: "Le média a été supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression du média" });
  }
};