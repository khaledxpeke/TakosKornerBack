const Ingrediant = require("../models/ingrediant");
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

exports.createIngredient = async (req, res, next) => {
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

    const { name, typeId } = req.body;
    const userId = req.user.id;
    const image = req.file.path;
    try {
      const ingredient = await Ingrediant.create({
        name,
        image,
        type: typeId,
        createdBy: userId,
      });
      await ingredient.save();
      res.status(201).json({ingredient,message:"ingrediant créer avec succées"});
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.addIngrediantToProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { ingrediantId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: `Aucun produit trouvé avec cet ID: ${productId}`,
      });
    }

    const ingrediant = await Ingrediant.findById(ingrediantId);
    if (!ingrediant) {
      return res.status(404).json({
        message: `Aucun ingrediant trouvé avec cet ID: ${ingrediantId}`,
      });
    }

    // Check if the ingrediant already exists in the product
    const ingrediantIndex = product.ingrediants.findIndex(
      (ingrediant) => ingrediant.toString() === ingrediantId
    );
    if (ingrediantIndex !== -1) {
      return res.status(409).json({
        message: `Ingrediant avec ID ${ingrediantId} déja existant dans le produit`,
      });
    }

    product.ingrediants.push(ingrediant);
    if (!product.type.includes(ingrediant.type)) {
      product.type.push(ingrediant.type);
    }
    await product.save();
    ingrediant.product.push(productId);
    await ingrediant.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Some error occurred while adding ingrediant to product",
      error: error.message,
    });
  }
};
exports.getIngrediantByProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const ingrediants = await Ingrediant.find({ product: productId }).populate(
      "type"
    );
    res.status(200).json(ingrediants);
  } catch (error) {
    res.status(400).json({
      message: "Aucun ingrediant trouvé",
      error: error.message,
    });
  }
};

exports.getIngredientsByType = async (req, res, next) => {
  const { productId, typeId } = req.params;

  try {
    const ingrediants = await Ingrediant.find({
      product: productId,
      type: typeId,
    }).populate("type");
    res.status(200).json(ingrediants);
  } catch (error) {
    res.status(500).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.getAllIngrediants = async (req, res, next) => {
  try {
    const ingrediants = await Ingrediant.find().populate("type");
    res.status(200).json(ingrediants);
  } catch (error) {
    res.status(400).json({
      message: "Aucun ingrediant trouvé",
      error: error.message,
    });
  }
};

exports.updateIngrediant = async (req, res) => {
  const ingrediantId = req.params.ingrediantId;
  upload.single("image")(req, res, async (err) => {
    const { name,type } = req.body;
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
    const ingrediant = await Ingrediant.findById(ingrediantId);
    if (!ingrediant) {
      res.status(500).json({ message: "aucun Ingrediant trouvée" });
    }
    if (req.file) {
      if (ingrediant.image) {
        fs.unlinkSync(ingrediant.image);
      }
      ingrediant.image = req.file.path;
    }
    try {
      const updatedingrediant = await Ingrediant.findByIdAndUpdate(ingrediantId, {
        name: name || ingrediant.name,
        image: ingrediant.image,
        type: type|| ingrediant.type,  
      });

      res
        .status(200)
        .json({ message: "Ingrediant modifié avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

exports.deleteIngredient = async (req, res, next) => {
  const { ingrediantId } = req.params;

  try {
    const ingrediant = await Ingrediant.findById(ingrediantId);

    if (!ingrediant) {
      return res.status(404).json({
        message: "Aucun ingrediant trouvé",
      });
    }
    if (ingrediant.image) {
      fs.unlink(ingrediant.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "Aucun ingrediant image trouvé",
          });
        }
      });
    }
    await Ingrediant.deleteOne({ _id: ingrediant._id });

    // Remove the ingredient from the product's ingredients array
    await Product.findByIdAndUpdate(ingrediant.product, {
      $pull: { ingrediants: ingrediantId },
    });

    res.status(200).json({
      message: "Ingredient supprimer avec succées",
    });
  } catch (error) {
    res.status(500).json({
      message: "Some error occurred",
      error: error.message,
    });
  }
};
