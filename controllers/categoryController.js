const Category = require("../models/category");
const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");
const fs = require("fs");
const Ingrediant = require("../models/ingrediant");
const Settings = require("../models/settings");
const path = require("path");

const upload = multer({ storage: multerStorage });
exports.createCategory = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Le téléchargement de l'image a échoué",
        error: err.message,
      });
    }
    if (!req.file) {
      return res.status(400).json({
        message: "Ajouter une image",
        error: "Veuillez télécharger une image",
      });
    }

    const userId = req.user.user._id;
    const image = `uploads/${req.file?.filename}` || "";
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
    const settings = await Settings.findOne();
    const tva = settings?.tva || 0;
    const categories = await Category.find().populate({
      path: "products",
      select:
        "name price image type choice description category outOfStock variations visible",
        populate: [
          {
            path: "type",
            select: "name message min selection payment max"
          },
          {
            path: "variations._id",
            model: 'Variation',
            select: "name price"
          }
        ]
    });
    const populatedCategories = await Promise.all(
      categories.map(async (category) => {
        const categoryObj = category.toObject();

        categoryObj.products = await Promise.all(
          category.products
            .filter((product) => product.visible !== false)
            .map(async (product) => {
              const productObj = product.toObject();
              productObj.price = Number(
                (productObj.price * (1 + tva / 100)).toFixed(2)
              );

              productObj.variations = productObj.variations.map(v => ({
                _id: v._id._id,
                name: v._id.name,
                price: v.price
              }));
              const typesWithIngredients = await Promise.all(
                product.type.map(async (type) => {
                  const typeObj = type.toObject();

                  const typeIngredients = await Ingrediant.find({
                    types: type._id,
                    visible: true,
                  }).select("name image price suppPrice outOfStock visible");
                  if (typeIngredients.length > 0) {
                    typeObj.ingrediants = typeIngredients.map((ing) => {
                      const basePrice = !type.payment
                        ? ing.suppPrice
                        : ing.price;
                      const priceWithTVA = Number(
                        (basePrice * (1 + tva / 100)).toFixed(2)
                      );
                      return {
                        _id: ing._id,
                        name: ing.name,
                        image: ing.image,
                        price: priceWithTVA,
                        outOfStock: ing.outOfStock,
                        visible: ing.visible,
                      };
                    });
                    return typeObj;
                  }
                  return null;
                })
              );

              productObj.type = typesWithIngredients.filter(
                (type) => type !== null
              );
              return productObj;
            })
        );

        return categoryObj;
      })
    );
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
      return res.status(500).json({ message: "Probleme image" });
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(500).json({ message: "Aucun Categorie trouvée" });
    }
    if (req.file) {
      const image = `uploads\\${req.file?.filename}` || "";
      if (category.image) {
        const imagePath = path.join(__dirname, "..", category.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
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
      const imagePath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await Category.findByIdAndDelete(category);

    res.status(200).json({ message: "categorie supprimée avec succées" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
