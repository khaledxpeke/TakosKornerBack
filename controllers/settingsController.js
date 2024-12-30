const Settings = require("../models/settings");
const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());
const multer = require("multer");
const multipleUpload = require("../middleware/multipleUpload");
const fs = require("fs");
const path = require("path");
const { default: mongoose } = require("mongoose");

exports.addSettings = async (req, res) => {
  try {
    const { currency } = req.body;
    if (!currency) {
      return res.status(400).json({ message: "La devise est requise" });
    }

    const existing = await Settings.findOne();
    if (existing) {
      if (existing.currencies.includes(currency.toUpperCase())) {
        return res.status(400).json({ message: "La devise existe déjà" });
      }

      existing.currencies.push(currency.toUpperCase());

      await existing.save();
      return res
        .status(200)
        .json({ existing, message: "La devise ajoutée avec succées" });
    } else {
      if (currency === undefined) {
        return res.status(400).json({ message: "La devise est requise" });
      }
      const newSettings = new Settings({
        currencies: [currency.toUpperCase()],
        defaultCurrency: currency.toUpperCase(),
      });
      await newSettings.save();
      return res
        .status(201)
        .json({ newSettings, message: "La devise ajoutée avec succées" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Aucun paramètre trouvée" });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCurrencies = async (req, res) => {
  try {
    const currencies = await Settings.findOne();
    if (!currencies) {
      return res.status(404).json({ message: "Aucune devise trouvée" });
    }

    res.status(200).json({
      currencies: currencies.currencies,
      defaultCurrency: currencies.defaultCurrency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDefaultCurrency = async (req, res) => {
  try {
    const { defaultCurrency } = req.body;
    if (!defaultCurrency) {
      return res
        .status(400)
        .json({ message: "La devise par défaut est requise" });
    }

    const currencyDoc = await Settings.findOne();
    if (
      !currencyDoc ||
      !currencyDoc.currencies.includes(defaultCurrency.toUpperCase())
    ) {
      return res.status(400).json({ message: "Devise invalide" });
    }

    currencyDoc.defaultCurrency = defaultCurrency.toUpperCase();
    await currencyDoc.save();

    res.status(200).json({
      message: "Devise par défaut mise à jour",
      defaultCurrency: currencyDoc.defaultCurrency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCurrency = async (req, res) => {
  try {
    const { currency } = req.body;
    if (!currency) {
      return res.status(400).json({ message: "La devise est requise" });
    }

    const currencyDoc = await Settings.findOne();
    if (
      !currencyDoc ||
      !currencyDoc.currencies.includes(currency.toUpperCase())
    ) {
      return res.status(400).json({ message: "Devise non trouvée" });
    }

    currencyDoc.currencies = currencyDoc.currencies.filter(
      (c) => c !== currency.toUpperCase()
    );
    if (currencyDoc.defaultCurrency === currency.toUpperCase()) {
      currencyDoc.defaultCurrency = currencyDoc.currencies[0];
    }

    await currencyDoc.save();
    res.status(200).json({
      message: "Devise supprimée avec succès",
      currencies: currencyDoc.currencies,
      defaultCurrency: currencyDoc.defaultCurrency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.updateCurrencyOrTva = async (req, res) => {
//   try {
//     const { oldCurrency, newCurrency, tva, maxExtras, maxDessert, maxDrink } =
//       req.body;

//     const settings = await Settings.findOne();
//     if (!settings) {
//       return res.status(404).json({ message: "Settings not found" });
//     }

//     if (oldCurrency && newCurrency) {
//       const oldCurrencyUpper = oldCurrency.toUpperCase();
//       const newCurrencyUpper = newCurrency.toUpperCase();

//       if (!settings.currencies.includes(oldCurrencyUpper)) {
//         return res
//           .status(400)
//           .json({ message: "Old currency not found in the list" });
//       }

//       if (settings.currencies.includes(newCurrencyUpper)) {
//         return res
//           .status(400)
//           .json({ message: "New currency already exists in the list" });
//       }

//       settings.currencies = settings.currencies.map((c) =>
//         c === oldCurrencyUpper ? newCurrencyUpper : c
//       );

//       if (settings.defaultCurrency === oldCurrencyUpper) {
//         settings.defaultCurrency = newCurrencyUpper;
//       }
//     }

//     if (tva !== undefined) {
//       if (tva < 0) {
//         return res
//           .status(400)
//           .json({ message: "TVA must be a positive number" });
//       }
//       settings.tva = tva;
//       settings.maxExtras = maxExtras || settings.maxExtras;
//       settings.maxDessert = maxDessert || settings.maxDessert;
//       settings.maxDrink = maxDrink || settings.maxDrink;
//     }

//     await settings.save();

//     res.status(200).json({
//       message: "Settings updated successfully",
//       settings,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.updateSettings = async (req, res) => {
  multipleUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Le téléchargement de l'image a échoué",
        error: err.message,
      });
    }

    try {
      const {
        oldCurrency,
        newCurrency,
        tva,
        maxExtras,
        maxDessert,
        maxDrink,
        method,
        address,
      } = req.body;
      const settings = await Settings.findOne();

      if (!settings) {
        return res.status(404).json({ message: "Paramètres non trouvés" });
      }

      if (oldCurrency && newCurrency) {
        const oldCurrencyUpper = oldCurrency.toUpperCase();
        const newCurrencyUpper = newCurrency.toUpperCase();

        if (!settings.currencies.includes(oldCurrencyUpper)) {
          return res
            .status(400)
            .json({ message: "Ancienne devise non trouvée" });
        }
        if (
          settings.currencies.includes(newCurrencyUpper) &&
          oldCurrencyUpper !== newCurrencyUpper
        ) {
          return res
            .status(400)
            .json({ message: "la nouvelle devise déjà existe " });
        }

        settings.currencies = settings.currencies.map((c) =>
          c === oldCurrencyUpper ? newCurrencyUpper : c
        );
        if (settings.defaultCurrency === oldCurrencyUpper) {
          settings.defaultCurrency = newCurrencyUpper;
        }
      }

      if (tva !== undefined) {
        if (tva < 0) {
          return res.status(400).json({ message: "La TVA doit être positive" });
        }
        settings.tva = tva;
        settings.maxExtras = maxExtras || settings.maxExtras;
        settings.maxDessert = maxDessert || settings.maxDessert;
        settings.maxDrink = maxDrink || settings.maxDrink;
      }

      if (method) {
        const parsedMethods = JSON.parse(method);
        settings.method = parsedMethods.map((updatedMethod) => {
          if (updatedMethod._id) {
            const existingMethod = settings.method.find(
              (m) => m._id.toString() === updatedMethod._id
            );
            if (existingMethod) {
              return {
                _id: existingMethod._id,
                label: updatedMethod.label,
                isActive:
                  updatedMethod.isActive !== undefined
                    ? updatedMethod.isActive
                    : existingMethod.isActive,
              };
            }
          }
          return {
            _id: updatedMethod._id || new mongoose.Types.ObjectId(),
            label: updatedMethod.label,
            isActive:
              updatedMethod.isActive !== undefined
                ? updatedMethod.isActive
                : true,
          };
        });
      }

      // Handle logo upload
      if (req.files?.logo) {
        const logo = `uploads\\${req.files.logo[0].filename}`;
        if (settings.logo) {
          const oldPath = path.join(__dirname, "..", settings.logo);

          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        settings.logo = logo;
      }

      if (req.files?.banner) {
        const banner = `uploads\\${req.files.banner[0].filename}`;
        if (settings.banner) {
          const oldPath = path.join(__dirname, "..", settings.banner);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        settings.banner = banner;
      }
      if (address) {
        settings.address = address || settings.address;
      }

      await settings.save();
      res.status(200).json({
        message: "Paramètres mis à jour avec succès",
        settings,
      });
    } catch (error) {
      if (req.files) {
        Object.values(req.files).forEach((files) => {
          files.forEach((file) => {
            fs.unlinkSync(
              path.join(__dirname, "..", `uploads\\${file.filename}`)
            );
          });
        });
      }
      res.status(500).json({ error: error.message });
    }
  });
};
