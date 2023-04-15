const Category = require("../models/category");
const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());

exports.createCategory = async (req, res) => {
  const userId = req.user.id;
  const category = new Category({
    createdBy: userId,
    name: req.body.name,
    image: req.body.image,
    products: req.body.products,
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("products");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId).populate(
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
  const userId = req.user.id;
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    if (category.createdBy !== userId) {
        return res.status(403).json({ message: "You do not have permission to update this product" });
      }
    category.name = req.body.name || category.name;
    category.image = req.body.image || category.image;
    category.products = req.body.products || category.products;
    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
    const userId = req.user.id;
    const categoryId = req.params.categoryId;
  try {
    const category = await Category.findByIdAndDelete({ _id: categoryId, createdBy: userId });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
