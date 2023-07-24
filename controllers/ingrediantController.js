const Ingrediant = require("../models/ingrediant");
const Product = require("../models/product");
const Type = require("../models/type");
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

    const { name, typeId ,price,currency} = req.body;
    const userId = req.user.user._id;
    const image = req.file.path;
    try {
      const ingredient = await Ingrediant.create({
        name,
        image,
        type: typeId,
        createdBy: userId,
      });
      if (price && currency) {
        ingredient.price = price;
        ingredient.currency = currency;
      }
      await ingredient.save();
      res
        .status(201)
        .json({ ingredient, message: "ingrediant créer avec succées" });
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
exports.getAllIngrediantsByType = async (req, res, next) => {
  try {
    const ingrediants = await Ingrediant.find({}, { _id: 1, name: 1 }).populate(
      "type",
      { name: 1 }
    );
    
    // Group ingredients by type name
    const ingrediantsByType = {};
    ingrediants.forEach((ingrediant) => {
      const { type } = ingrediant;
      if (type) {
        const { name } = type;
        if (!ingrediantsByType[name]) {
          ingrediantsByType[name] = [];
        }
        ingrediantsByType[name].push({ _id: ingrediant._id, name: ingrediant.name,type:ingrediant.type });
      }
    });
    
    res.status(200).json(ingrediantsByType);
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
    const { name, type,price, currency } = req.body;
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
      ingrediant.name = name || ingrediant.name;
      ingrediant.type = type || ingrediant.type;
      if (price !== undefined) {
        ingrediant.price = price !== "" ? price : null;
      }
      if (currency !== undefined) {
        ingrediant.currency = currency !== "" ? currency : null;
      }
      const updatedIngrediant = await ingrediant.save();

      const products = await Product.find({ ingrediants: ingrediantId });

      for (const product of products) {
        const ingrediants = await Promise.all(
          product.ingrediants.map(async (ingrediant) => {
            return await Ingrediant.findById(ingrediant);
          })
        );
        const types = ingrediants.map((ingrediant) => ingrediant.type);
        const uniqueTypes = types.reduce((unique, current) => {
          const isDuplicate = unique.some(
            (obj) => obj.valueOf() === current.valueOf()
          );
          if (!isDuplicate) {
            unique.push(current);
          }
          return unique;
        }, []);
        product.type = uniqueTypes;
        await product.save();
      }

      res.status(200).json({ message: "Ingrediant modifié avec succées" });
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
