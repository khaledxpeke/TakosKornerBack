const Supplement = require("../models/supplement");
const Product = require("../models/product");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");
const fs = require("fs");

const upload = multer({ storage: multerStorage });
exports.createSupplement = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
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

    const { name, price, currency } = req.body;
    const userId = req.user.user._id;
    const image = req.file.path;
    try {
      const supplements = await Supplement.create({
        name,
        price,
        image,
        currency,
        createdBy: userId,
      });
      res.status(201).json({
        supplements,message:"supplement créer avec succées"
      });
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};
exports.addSupplementToProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { supplementId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: `Aucun produit avec cet ID: ${productId}`,
      });
    }

    const supplement = await Supplement.findById(supplementId);
    if (!supplement) {
      return res.status(404).json({
        message: `Aucun supplement avec cet ID: ${supplementId}`,
      });
    }

    if (product.supplements.includes(supplementId)) {
      return res.status(409).json({
        message: `Supplement avec ID ${supplementId} existe déjà dans le produit`,
      });
    }

    // Add the product ID to the supplement's "products" array
    supplement.products.push(productId);
    await supplement.save();

    // Add the supplement ID to the product's "supplements" array
    product.supplements.push(supplementId);
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Some error occurred while adding supplement to product",
      error: error.message,
    });
  }
};

exports.getSupplementByProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const supplements = await Supplement.find({ products: productId });
    res.status(200).json(supplements);
  } catch (error) {
    res.status(400).json({
      message: "Aucun supplement trouvé",
      error: error.message,
    });
  }
};

exports.getAllSupplements = async (req, res, next) => {
  try {
    const supplements = await Supplement.find();
    res.status(200).json(supplements);
  } catch (error) {
    res.status(400).json({
      message: "Auucun supplement trouvé",
      error: error.message,
    });
  }
};

exports.getSupplementById = async (req, res, next) => {
  try {
    const { supplementId } = req.params;
    const supplements = await Supplement.findById(supplementId);
    res.status(200).json({
      supplements,
    });
  } catch (error) {
    res.status(400).json({
      message: "Auucun supplement trouvé",
      error: error.message,
    });
  }
};

exports.deleteSupplement = async (req, res, next) => {
  const { supplementId } = req.params;
  try {
    const supplements = await Supplement.findById(supplementId);

    if (!supplements) {
      return res.status(404).json({
        message: "Auucun supplement trouvé",
      });
    }
    if (supplements.image) {
      fs.unlink(supplements.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "Auucun supplement image trouvé",
          });
        }
      });
    }

    await Supplement.deleteOne({ _id: supplements._id });

    // Remove the ingredient from the product's ingredients array
    await Product.findByIdAndUpdate(supplements.product, {
      $pull: { supplements: supplementId },
    });

    res.status(200).json({
      message: "Supplement ajouté avec succées",
      supplements,
    });
  } catch (error) {
    res.status(500).json({
      message: "Some error occurred",
      error: error.message,
    });
  }
};

exports.updateSupplement = async (req, res) => {
  const supplementId = req.params.supplementId;
  upload.single("image")(req, res, async (err) => {
    const { name,type,price,currency } = req.body;
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
    const supplement = await Supplement.findById(supplementId);
    if (!supplement) {
      res.status(500).json({ message: "aucun Supplement trouvée" });
    }
    if (req.file) {
      if (supplement.image) {
        fs.unlinkSync(supplement.image);
      }
      supplement.image = req.file.path;
    }
    try {
      const updatedsupplement = await Supplement.findByIdAndUpdate(supplementId, {
        name: name || supplement.name,
        price: price || supplement.price,
        currency: currency || supplement.currency,
        image: supplement.image,
        type: type|| supplement.type,  
      });

      res
        .status(200)
        .json({ message: "Supplement modifié avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};