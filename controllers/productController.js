const Product = require("../models/product");
const Rule = require("../models/rules");
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
    const image = `uploads/${req.file?.filename}`|| ""; ;
    const { currency, choice,description } = req.body;
    // const ingrediantIds = req.body.ingrediants?.split(",") || [];
    const typeIds = req.body.type || []; 
    console.log("typeIds"+typeIds);
    console.log(req.body.type);
    // const rules = JSON.parse(req.body.rules) || [];
    // const supplementIds = req.body.supplements?.split(",") || [];
    const rulesIds = [];
    try {
      let product = await Product.findOne({ name });

      if (product) {
        return res.status(400).json({
          message: "Produit existe déja",
        });
      } else {
        // for (const ruleData of rules) {
        //   try {
        //     const rule = new Rule(ruleData);
        //     const savedRule = await rule.save();
        //     rulesIds.push(savedRule._id);
        //   } catch (error) {
        //     console.error("Error saving rule:", error);
        //   }
        // }
        const product = new Product({
          name,
          description,
          price,
          category: categoryId,
          // currency,
          type: typeIds,
          // rules: rulesIds,
          createdBy: userId,
          // ingrediants: ingrediantIds,
          // supplements: supplementIds,
          choice,
        });
        if (image) {
          product.image = image;
          await product.save();
        }

        // const productIngrediants = await Promise.all(
        //   ingrediantIds.map(async (ingrediant) => {
        //     return await Ingrediant.findById(ingrediant);
        //   })
        // );
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
        // await Ingrediant.updateMany(
        //   { _id: { $in: ingrediantIds } },
        //   { $push: { product: savedProduct._id } }
        // );

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
    const products = await Product.find({}).populate([
      {
        path: "type",
        select: "name",
      },
      // {
      //   path: "rules",
      //   select: "type free quantity",
      // },
      // {
      //   path: "ingrediants",
      //   select: "name",
      //   populate: { path: "types", select: "name" },
      // },
    ]);
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
      description,
      // currency,
      supplements,
      ingrediants,
      category,
      choice,
      rules,
      type,
    } = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (req.file) {
        const image = `uploads\\${req.file?.filename}`|| ""; 
        if (product.image) {
          fs.unlinkSync(product.image);
        }
        product.image = image;
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      // product.currency = currency || product.currency;
      product.category = category || product.category;
      product.choice = choice || product.choice;

      product.supplements = supplements ? supplements.split(",") : [];

      product.ingrediants = ingrediants ? ingrediants.split(",") : [];
      product.type = type ? type.split(",") : [];

      if (rules) {
        const updatedRules = await Promise.all(
          rules.map(async (rule) => {
            if (rule._id) {
              return {
                _id: rule._id,
                type: rule.type,
                free: rule.free || 1,
                quantity: rule.quantity || 1,
              };
            } else {
              const newRule = new Rule(rule);
              const returnedRule = await newRule.save();
              return await returnedRule;
            }
          })
        );
        const removedRuleIds = product.rules.filter(
          (existingRuleId) =>
            !updatedRules.some(
              (updatedRule) =>
                updatedRule._id.toString() === existingRuleId.toString()
            )
        );

        await Rule.deleteMany({ _id: { $in: removedRuleIds } });
        product.rules = updatedRules.map((rule) => rule._id);
        await Promise.all(
          updatedRules.map(async (rule) => {
            await Rule.findByIdAndUpdate(rule._id, rule);
          })
        );
      }

      const updatedProduct = await product.save();

      res
        .status(200)
        .json({ updatedProduct, message: "Product updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  });
};
