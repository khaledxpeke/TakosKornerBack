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
      res.status(201).json({newCategory,message:"category created successfully"});
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
    const category = await Category.findById(categoryId).populate(
      "products"
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    category.name = req.body.name || category.name;
    category.image = req.body.image || category.image;
    category.products = req.body.products || category.products;
    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory, { message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  try {
    let category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (category.image) {
      fs.unlink(device.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "Device image not found",
          });
        }
      });
    }
    await Category.findByIdAndDelete(category);

    res.status(200).json({ message: "category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
