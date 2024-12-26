const User = require("../models/user");
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.register = async (req, res, next) => {
  const { email, password, fullName } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "L'utilisateur existe déjà" });
  }
  // const { country: phoneCountryCode, phoneNumber: formattedPhone } = phone(rawPhone);
  // if (!formattedPhone) {
  //   return res.status(400).json({ message: "Invalid phone number" });
  // }
  try {
    bcrypt.hash(password, 10).then(async (hash) => {
      await User.create({
        email,
        password: hash,
        fullName,
      })
        .then((user) => {
          const maxAge = 8 * 60 * 60;
          const token = jwt.sign({ id: user._id, email }, jwtSecret, {
            expiresIn: maxAge, // 3hrs in sec
          });
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 3hrs in ms
          });
          res.status(201).json({
            user: user,
            token: token,
          });
        })
        .catch((error) =>
          res.status(400).json({
            message: "Ce nom existe déjà",
            error: error.message,
          })
        );
    });
  } catch {
    res.status(400).json({
      message: "Une erreur s'est produite",
      error: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "L'email ou le mot de passe est incorrect !",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        message: "Utilisateur non trouvé",
        error: "Utilisateur non trouvé",
      });
    } else {
      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          const maxAge = 8 * 60 * 60;
          const tokenPayload = {
            user: user
          };
          const token = jwt.sign(tokenPayload, jwtSecret, {
            expiresIn: maxAge, // 3hrs in sec
          });
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 3hrs in ms
          });
          res.status(201).json({
            token: token,
          });
        } else {
          res
            .status(400)
            .json({ message: "L'email ou le mot de passe est incorrect !" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Une erreur s'est produite",
      error: error.message,
    });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({
      message: "Une erreur s'est produite",
      error: error.message,
    });
  }
};

exports.getUserbyId = async (req, res, next) => {
  const userId = req.user.user._id;
  if (!userId) {
    res.status(400).json({ message: " Id non trouvée" });
  } else {
    const user = await User.findById(userId);
    res.status(200).json({ user: user });
  }
};

exports.logout = async (req, res, next) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
