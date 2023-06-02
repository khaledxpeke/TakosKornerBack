const Category = require("../models/category");
const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");
const fs = require("fs");

const upload = multer({ storage: multerStorage });
exports.createCategory = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    const userId = req.user.id;
    const image = req.file.path;
    const category = new Category({
      createdBy: userId,
      name: req.body.name,
      image: image,
    });

    try {
      const newCategory = await category.save();
      res
        .status(201)
        .json({ newCategory, message: "categorie créer avec succées" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: "products",
      populate: [
        {
          path: "ingrediants",
          select: "name image",
          populate: { path: "type", select: "name" },
        },
        { path: "supplements", select: "name image price currency" },
        { path: "type", select: "name" },
      ],
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  const categoryId = req.params.categoryId;
  try {
    const category = await Category.findById(categoryId).populate("products");
    if (!category) {
      return res.status(404).json({ message: "Aucun categorie trouvée" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(500).json({ message: "Aucun Categorie trouvée" });
    }
    if (req.file) {
      if (category.image) {
        fs.unlinkSync(category.image);
      }
      category.image = req.file.path;
    }
    try {
      const updatedcategory = await Category.findByIdAndUpdate(categoryId, {
        name: req.body.name || category.name,
        image: category.image,
      });

      res
        .status(200)
        .json({ updatedcategory, message: "Categorie modifié avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

exports.deleteCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  try {
    let category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Aucun Categorie trouvée" });
    }
    console.log(category.image);
    if (category.image) {
      fs.unlink(category.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "Aucun Categorie image trouvée",
          });
        }
      });
    }
    await Category.findByIdAndDelete(category);

    res.status(200).json({ message: "categorie supprimée avec succées" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
