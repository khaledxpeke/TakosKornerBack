const Product = require("../models/product");
const Category = require("../models/category");
const Ingrediant = require("../models/ingrediant");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");
app.use(express.json());
// Set up multer upload middleware with the imported storage configuration
const upload = multer({ storage: multerStorage });
const fs = require("fs");

exports.addProductToCategory = async (req, res, next) => {
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

    const { categoryId } = req.params;
    const userId = req.user.user._id;
    const price = Number(req.body.price ?? "");
    const name = req.body.name.replace(/"/g, "");
    const image = req.file.path; // Get the image file path from the request
    const { currency, choice } = req.body;
    const ingrediantIds = req.body.ingrediants?.split(",") || [];
    const typeIds = req.body.type || [];
    const supplementIds = req.body.supplements?.split(",") || [];
    try {
      let product = await Product.findOne({ name });

      if (product) {
        return res.status(400).json({
          message: "Produit existe déja",
        });
      } else {
        const product = new Product({
          name,
          price,
          category: categoryId,
          currency,
          type: typeIds,
          createdBy: userId,
          ingrediants: ingrediantIds,
          supplements: supplementIds,
          choice,
        });
        if (image) {
          product.image = image;
          await product.save();
        }
        const productIngrediants = await Promise.all(
          ingrediantIds.map(async (ingrediant) => {
            return await Ingrediant.findById(ingrediant);
          })
        );
        // const types = productIngrediants.map((ingrediant) => ingrediant.type);
        // const uniqueTypes = types.reduce((unique, current) => {
        //   const isDuplicate = unique.some(
        //     (obj) => obj.valueOf() === current.valueOf()
        //   );
        //   if (!isDuplicate) {
        //     unique.push(current);
        //   }
        //   return unique;
        // }, []);
        // product.type = uniqueTypes;

        // Save the product
        const savedProduct = await product.save();

        const updatedCategory = await Category.findByIdAndUpdate(
          categoryId,
          { $push: { products: savedProduct._id } },
          { new: true }
        );
        // await Product.updateMany(
        //   { type: { $in: typeIds } },
        //   { $push: { product: savedProduct._id } }
        // );
        await Ingrediant.updateMany(
          { _id: { $in: ingrediantIds } },
          { $push: { product: savedProduct._id } }
        );

        res.status(201).json({
          product: savedProduct,
          category: updatedCategory,
          message: "Product ajouté avec succées",
        });
      }
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.getProductsByCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category: categoryId });

    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate({ path: "type" ,select: "name" });
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Aucun produit trouvé" });
    }
    if (product.image) {
      fs.unlink(product.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "Aucun produit image trouvé",
          });
        }
      });
    }
    await Product.findByIdAndDelete(product);
    await Category.updateMany(
      { products: productId },
      { $pull: { products: productId } }
    );
    await Ingrediant.updateMany(
      { product: productId },
      { $pull: { product: productId } }
    );
    res.status(200).json({ message: "Product supprimer avec succées" });
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  const productId = req.params.productId;
  upload.single("image")(req, res, async (err) => {
    const {
      name,
      price,
      currency,
      supplements,
      ingrediants,
      category,
      choice,
      type,
    } = req.body;
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      res.status(500).json({ message: "aucun produit trouvée" });
    }
    if (req.file) {
      if (product.image) {
        fs.unlinkSync(product.image);
      }
      product.image = req.file.path;
    }
    if (supplements) {
      product.supplements = req.body.supplements.split(",");
    } else {
      product.supplements = [];
    }
    if (type) {
      product.type = req.body.type;
    } else {
      product.type = [];
    }
    if (ingrediants) {
      product.ingrediants = ingrediants.split(",");
    } else {
      product.ingrediants = [];
    }
    try {
      const updatedproduct = await Product.findByIdAndUpdate(productId, {
        name: name || product.name,
        price: price || product.price,
        supplements: product.supplements,
        type: product.type,
        currency: currency || product.currency,
        category: category,
        ingrediants: product.ingrediants,
        image: product.image,
        choice: choice || product.choice,
      });
      let updatedIngrediants = [];
      if (ingrediants !== undefined) {
        updatedIngrediants = ingrediants.split(",");
      }
      const productIngrediants = await Promise.all(
        updatedIngrediants.map(async (ingrediant) => {
          return await Ingrediant.findById(ingrediant);
        })
      );
      // const types = productIngrediants.map((ingrediant) => ingrediant.type);
      // const uniqueTypes = types.reduce((unique, current) => {
      //   const isDuplicate = unique.some(
      //     (obj) => obj.valueOf() === current.valueOf()
      //   );
      //   if (!isDuplicate) {
      //     unique.push(current);
      //   }
      //   return unique;
      // }, []);
      // await Product.findByIdAndUpdate(productId, { type: uniqueTypes });
      await Category.findByIdAndUpdate(product.category, {
        $pull: { products: productId },
      });

      // Add the product to the new category
      await Category.findByIdAndUpdate(category, {
        $addToSet: { products: productId },
      });
      res.status(200).json({ message: "Produit modifié avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};
