const History = require("../models/History");
const Product = require("../models/product");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());
const transporter = require("../middleware/email");

exports.addHistory = async (req, res) => {
  const { products, pack, name, method, total, currency, commandNumber } =
    req.body;
  try {
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
            total: addon.price * addon.count,
          })),
          extras: uniqueExtras.map((extra) => ({
            _id: extra._id,
            name: extra.name,
            pu: extra.price,
            count: extra.count,
            total: extra.price * extra.count,
          })),
        };
      }),
      pack,
      name,
      currency,
      // email,
      method,
      total,
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
        console.log("Error occurred while saving history:", err);
        res.status(500).json({
          message: "Some error occured",
          error: err,
        });
      });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({ error: "Internal server error" });
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

exports.addEmail = async (req, res) => {
  const { email, commandNumber } = req.body;
  try {
    const history = await History.findOne({ commandNumber });
    const mailOptions = {
      from: "khaledbouajila5481@gmail.com",
      to: email,
      subject: "Ticket de commande",
      text: "",
      template: "/template/index",
      context: {
        commandNumber: commandNumber,
        name: history.name,
        products: history.product.map((product) => {
          return {
            platName: product.plat.name,
            currency: product.plat.currency,
            price: product.plat.price,
            addons: product.addons.map((addon) => {
              return {
                name: addon.name,
                count: addon.count,
                total: addon.total,
                currency: product.plat.currency,
              };
            }),
            extras: product.extras.map((extra) => {
              return {
                name: extra.name,
                count: extra.count,
                total: extra.total,
                currency: product.plat.currency,
              };
            }),
          };
        }),
        total: history.total,
      },
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({ error: "Internal server error" });
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
    res.status(500).json({ error: "Internal server error" });
  }
};
