const Product = require("../models/product");
// const Rule = require("../models/rules");
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
const path = require("path");
const Settings = require("../models/settings");

exports.addProductToCategory = async (req, res, next) => {
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

    const { categoryId } = req.params;
    const userId = req.user.user._id;
    const price = Number(req.body.price ?? "");
    const name = req.body.name.replace(/"/g, "");
    const image = `uploads/${req.file?.filename}` || "";
    const { currency, choice, description, outOfStock, visible, variations } =
      req.body;
    // const ingrediantIds = req.body.ingrediants?.split(",") || [];
    const typeIds = req.body.type || [];
    let variationsArray = [];
    if (variations) {
      variationsArray = Array.isArray(variations)
        ? variations
        : JSON.parse(variations);
    }
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
        const parsedTypeIds = Array.isArray(typeIds)
          ? typeIds
          : JSON.parse(typeIds);
        const product = new Product({
          name,
          description,
          price,
          category: categoryId,
          outOfStock,
          visible,
          // currency,
          type: parsedTypeIds,
          variations: variationsArray || [],
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
          message: "Produit ajouté avec succées",
        });
      }
    } catch (error) {
      res.status(400).json({
        message: "Une erreur s'est produite",
        error: error.message,
      });
    }
  });
};

exports.getProductsByCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category: categoryId }).populate({
      path: "type",
      select: "name",
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({
      message: "Une erreur s'est produite",
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
      message: "Une erreur s'est produite",
      error: error.message,
    });
  }
};

exports.getProductData = async (req, res) => {
  try {
    const { productId, variationId } = req.params;
    const settings = await Settings.findOne();
    const tva = settings?.tva || 0;

    const product = await Product.findById(productId)
      .populate({
        path: "type",
        select: "name message payment selection max min",
      })
      .populate({
        path: "variations._id",
        model: "Variation",
        select: "name price",
      })
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    product.variations = product.variations.map((v) => ({
      _id: v._id._id,
      name: v._id.name,
      price: v.price,
    }));

    const typesWithIngredients = await Promise.all(
      product.type.map(async (type) => {
        const typeIngredients = await Ingrediant.find({
          types: type._id,
          visible: true,
        })
          .populate({
            path: "variations",
            model: "Variation",
            select: "name price",
          })
          .select("name image price outOfStock visible")
          .lean();

        if (typeIngredients.length > 0) {
          return {
            ...type,
            ingrediants: typeIngredients.map((ing) => {
              const variation = ing.variations?.find(
                (v) => v._id.toString() === variationId
              );
              const price = variation ? variation.price : ing.price;
              const priceWithTVA = Number((price * (1 + tva / 100)).toFixed(2));

              return {
                _id: ing._id,
                name: ing.name,
                image: ing.image,
                price: priceWithTVA,
                outOfStock: ing.outOfStock,
                visible: ing.visible,
              };
            }),
          };
        }
        return null;
      })
    );

    const selectedVariation = product.variations?.find(
      (v) => v._id.toString() === variationId
    );
    const productPrice = selectedVariation
      ? selectedVariation.price
      : product.price;
    const finalPrice = Number((productPrice * (1 + tva / 100)).toFixed(2));

    res.status(200).json({
      ...product,
      price: finalPrice,
      type: typesWithIngredients.filter((t) => t !== null),
    });
  } catch (error) {
    res.status(500).json({
      message: "Une erreur s'est produite",
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
      const imagePath = path.join(__dirname, "..", product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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
      message: "Une erreur s'est produite",
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
      outOfStock,
      visible,
      // currency,
      supplements,
      ingrediants,
      category,
      choice,
      // rules,
      type,
      variations,
    } = req.body;

    try {
      let variationsArray = [];
      if (variations) {
        variationsArray = Array.isArray(variations)
          ? variations
          : JSON.parse(variations);
      }
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      if (req.file) {
        const image = `uploads\\${req.file?.filename}` || "";
        if (product.image) {
          const imagePath = path.join(__dirname, "..", product.image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        product.image = image;
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.outOfStock = outOfStock || product.outOfStock;
      product.visible = visible || product.visible;
      product.price = price || product.price;
      // product.currency = currency || product.currency;
      product.category = category || product.category;
      product.choice = choice || product.choice;

      product.supplements = supplements ? supplements.split(",") : [];

      product.ingrediants = ingrediants ? ingrediants.split(",") : [];
      product.type = type ? type.split(",") : [];
      if (variations) {
        product.variations = variationsArray || product.variations;
      }
      // if (rules) {
      //   const updatedRules = await Promise.all(
      //     rules.map(async (rule) => {
      //       if (rule._id) {
      //         return {
      //           _id: rule._id,
      //           type: rule.type,
      //           free: rule.free || 1,
      //           quantity: rule.quantity || 1,
      //         };
      //       } else {
      //         const newRule = new Rule(rule);
      //         const returnedRule = await newRule.save();
      //         return await returnedRule;
      //       }
      //     })
      //   );
      //   const removedRuleIds = product.rules.filter(
      //     (existingRuleId) =>
      //       !updatedRules.some(
      //         (updatedRule) =>
      //           updatedRule._id.toString() === existingRuleId.toString()
      //       )
      //   );

      //   await Rule.deleteMany({ _id: { $in: removedRuleIds } });
      //   product.rules = updatedRules.map((rule) => rule._id);
      //   await Promise.all(
      //     updatedRules.map(async (rule) => {
      //       await Rule.findByIdAndUpdate(rule._id, rule);
      //     })
      //   );
      // }

      const updatedProduct = await product.save();

      res
        .status(200)
        .json({ updatedProduct, message: "Produit mis à jour avec succès" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Erreur de serveur" });
    }
  });
};
