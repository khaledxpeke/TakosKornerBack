const Category = require("../models/category");
const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");
const fs = require("fs");
const Ingrediant = require("../models/ingrediant");

const upload = multer({ storage: multerStorage });
exports.createCategory = async (req, res) => {
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

    const userId = req.user.user._id;
    const image = `uploads/${req.file?.filename}`|| ""; ;
    try {
    const category = await Category.create({
      createdBy: userId,
      name: req.body.name,
      image,
    });

      const newCategory = await category.save();
      res
        .status(201)
        .json({ newCategory, message: "categorie créer avec succées" });
   } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
});
};


exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: "products",
      select: "name price image type choice description",
      populate: {
        path: "type",
        select: "name message isRequired selection payment quantity"
      }
    });
    const populatedCategories = await Promise.all(categories.map(async (category) => {
      const categoryObj = category.toObject();
      
      categoryObj.products = await Promise.all(category.products.map(async (product) => {
        const productObj = product.toObject();
        
        productObj.type = await Promise.all(product.type.map(async (type) => {
          const typeObj = type.toObject();
          
          const typeIngredients = await Ingrediant.find({
            types: type._id,
            outOfStock: false
          }).select("name image price suppPrice outOfStock");
          
          typeObj.ingrediants = typeIngredients.map(ing => {

            const calculatedPrice = !type.payment ? ing.suppPrice : ing.price;
            return {
              _id: ing._id,
              name: ing.name,
              image: ing.image,
              price: calculatedPrice,
              // outOfStock: ing.outOfStock
            };
          });
          return typeObj;
        }));
        
        return productObj;
      }));
      
      return categoryObj;
    }));
    res.status(200).json(populatedCategories);
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
      const image = `uploads\\${req.file?.filename}`|| ""; 
      if (category.image) {
        fs.unlinkSync(category.image);
      }
      category.image = image;
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
