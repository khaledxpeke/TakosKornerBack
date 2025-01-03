const History = require("../models/History");
const Product = require("../models/product");
const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());
const transporter = require("../middleware/email");
var pdf = require("pdf-creator-node");
const path = require('path');
var fs = require("fs");
const Settings = require("../models/settings");

exports.addHistory = async (req, res) => {
  const { products, pack, name, method, total, currency, commandNumber } =
    req.body;
  try {
    const settings = await Settings.findOne();
    const methodExists = settings.method.find(m => m._id.toString() === method);
    if (!methodExists || !methodExists.isActive) {
      return res.status(404).json({ message: 'Mode de paiement non trouvé' });
    }
    const tva = settings?.tva || 0;
    const history = await new History({
      product: products.map((product) => {
        const uniqueAddons = Object.values(
          product.addons.reduce((acc, addon) => {
            const key = `${addon.name}-${addon.price}`;
            if (!acc[key]) {
              acc[key] = {
                _id: addon._id,
                name: addon.name,
                price: addon.price,
                pu: addon.price,
                count: 0,
              };
            }
            acc[key].count += 1;
            return acc;
          }, {})
        );
        const uniqueExtras = Object.values(
          product.extras.reduce((acc, extra) => {
            const key = `${extra.name}-${extra.price}`;
            if (!acc[key]) {
              acc[key] = {
                _id: extra._id,
                name: extra.name,
                price: extra.price,
                pu: extra.price,
                count: 0,
              };
            }
            acc[key].count += 1;
            return acc;
          }, {})
        );
        return {
          plat: product.plat,
          total: product.total,
          addons: uniqueAddons.map((addon) => ({
            _id: addon._id,
            name: addon.name,
            pu: addon.price,
            count: addon.count,
            total: (addon.price * addon.count).toFixed(2),
          })),
          extras: uniqueExtras.map((extra) => ({
            _id: extra._id,
            name: extra.name,
            pu: extra.price,
            count: extra.count,
            total: (extra.price * extra.count).toFixed(2),
          })),
        };
      }),
      pack,
      name,
      currency,
      tva,
      logo: settings.logo,
      // email,
      method: {
        _id: methodExists._id,
        label: methodExists.label
      },
      total:total,
      commandNumber: parseInt(commandNumber, 10),
    });
    // const mailOptions = {
    //   from: "khaledbouajila5481@gmail.com",
    //   to: email,
    //   subject: "Ticket de commande",
    //   text: "",
    //   template: "/template/index",
    //   context: {
    //     commandNumber: commandNumber,
    //     name: name,
    //     products: history.product.map((product) => {
    //       return {
    //         platName: product.plat.name,
    //         currency: product.plat.currency,
    //         price: product.plat.price,
    //         addons: product.addons.map((addon) => {
    //           return {
    //             name: addon.name,
    //             count: addon.count,
    //             total: addon.total,
    //             currency: product.plat.currency,
    //           };
    //         }),
    //         extras: product.extras.map((extra) => {
    //           return {
    //             name: extra.name,
    //             count: extra.count,
    //             total: extra.total,
    //             currency: product.plat.currency,
    //           };
    //         }),
    //       };
    //     }),
    //     total: total,
    //   },
    // };
    // await transporter.sendMail(mailOptions);
    history
      .save()
      .then((result) => {
        res.status(201).json(result);
      })

      .catch((err) => {
        console.log("Une erreur s'est produite lors de l'enregistrement de l'historique:", err);
        res.status(500).json({
          message: "Une erreur s'est produite",
          error: err,
        });
      });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

exports.getHistory = async (req, res) => {
  const history = await History.find()
    .sort({ boughtAt: -1 })
    .populate({
      path: "product",
      populate: [
        {
          path: "plat.category",
          select: "name",
        },
      ],
    });
  res.status(200).json(history);
};

exports.getLast10Orders = async (req, res) => {
  try {
    const orders = await History.find()
      .sort({ boughtAt: -1 })
      .limit(10)
      .populate("product.plat._id");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
    throw error;
  }
};

const generatePDF = async (orderData) => {
  const html = fs.readFileSync(path.join(__dirname, '../template/pdf.handlebars'), 'utf8');
  const settings = await Settings.findOne();
    const tva = settings?.tva || 0;
    const address = settings?.address;
    const tvaAmount = orderData.total * (tva/100);
    const logoUrl = `${process.env.BASE_URL}/api/${settings.logo.replace(/\\/g, '/')}`;
  const options = {
    format: 'A4',
    orientation: 'portrait',
    border: '10mm',
    footer: {
      height: '10mm'
    },
    type: "pdf",
    localUrlAccess: true,
    css: `
      body {
        font-family: Arial, sans-serif;
        font-style: normal;
      }
      * {
        font-style: normal !important;
        font-family: Arial, sans-serif !important;
      }
    `
  };

  const document = {
    html: html,
    data: {
      name: orderData.name,
      apiUrl: process.env.BASE_URL,
      commandNumber: orderData.commandNumber,
      boughtAt: orderData.boughtAt.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      products: orderData.product.map((product) => {
        return {
          platName: product.plat.name,
          price: product.plat.price,
          currency: orderData.currency,
          addons: product.addons.map((addon) => ({
            name: addon.name,
            count: addon.count,
            total: addon.total,
            currency: orderData.currency,
          })),
          extras: product.extras.map((extra) => ({
            name: extra.name,
            count: extra.count,
            total: extra.total,
            currency: orderData.currency,
          })),
        };
      }),
      total: orderData.total.toFixed(2),
      tvaAmount: tvaAmount.toFixed(2),
      tva: tva,
      logo: logoUrl,
      address: address,
      pack: orderData.pack,
      method: orderData.method.label,
      currency: orderData.currency
    },
    path: `./uploads/order-${orderData.commandNumber}.pdf`
  };

  try {
    await pdf.create(document, options);
    return document.path;
  } catch (error) {
    console.error('Erreur de génération de PDF:', error);
    throw error;
  }
};

exports.addEmail = async (req, res) => {
  const { email, commandNumber } = req.body;
  try {
    const history = await History.findOne({ commandNumber }).sort({ boughtAt: -1 });
    if (!history) {
      return res.status(404).json({ message: "Ordre non trouvée" });
    }
    const settings = await Settings.findOne();
    const tva = settings?.tva || 0;
    const tvaAmount = history.total * (tva/100);
    const orderDate = new Date(history.boughtAt).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    if (orderDate < today) {
      return res.status(400).json({ 
        message: "Impossible d'envoyer un e-mail pour les commandes des jours précédents" 
      });
    }
    const logoUrl = `${process.env.BASE_URL}/api/${settings.logo.replace(/\\/g, '/')}`;
    const pdfPath = await generatePDF(history);
    const mailOptions = {
      from: "khaledbouajila5481@gmail.com",
      to: email,
      subject: "Ticket de commande",
      text: "",
      template: "/template/index",
      attachments: [{
        filename: `order-${history.commandNumber}.pdf`,
        path: pdfPath
      }],
      context: {
        apiUrl: process.env.BASE_URL,
        commandNumber: commandNumber,
        logo: logoUrl,
        isEmail: true,
        name: history.name,
        boughtAt: history.boughtAt.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        products: history.product.map((product) => {
          return {
            platName: product.plat.name,
            price: product.plat.price,
            currency: history.currency,
            addons: product.addons.map((addon) => {
              return {
                name: addon.name,
                count: addon.count,
                total: addon.total,
                currency: history.currency,
              };
            }),
            extras: product.extras.map((extra) => {
              return {
                name: extra.name,
                count: extra.count,
                total: extra.total,
                currency: history.currency,
              };
            }),
          };
        }),
        total: history.total.toFixed(2),
        tvaAmount: tvaAmount.toFixed(2),
        tva: tva,
        pack: history.pack,
        method: history.method.label,
        currency: history.currency,
      },
    };
    await transporter.sendMail(mailOptions);
    fs.unlinkSync(pdfPath);
    res.status(200).json({ message: "E-mail envoyé avec succès" });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

exports.getCommandNumber = async (req, res) => {
  const currentDate = new Date();

  try {
    const lastHistoryEntry = await History.findOne().sort({ boughtAt: -1 });

    let lastCommandNumber = lastHistoryEntry
      ? lastHistoryEntry.commandNumber
      : 0;
    const lastCommandDate = lastHistoryEntry
      ? lastHistoryEntry.boughtAt
      : currentDate;
    const daysDifference = Math.floor(
      (currentDate - lastCommandDate) / (1000 * 60 * 60 * 24)
    );
    if (daysDifference > 0) {
      lastCommandNumber = 1;
    } else {
      lastCommandNumber++;
    }

    res.status(200).json(lastCommandNumber);
  } catch (error) {
    console.error("Error getting command number:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
