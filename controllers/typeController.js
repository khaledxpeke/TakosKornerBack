const Type = require("../models/type");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.createType = async (req, res, next) => {
  const { name } = req.body;

  try {
    // Check if the type already exists
    const existingType = await Type.findOne({ name });
    if (existingType) {
      return res.status(400).json({ message: "Type already exists" });
    }

    // Create a new type
    const newType = new Type({ name });
    await newType.save();

    res.status(201).json({ message: "Type created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Some error occurred", error: error.message });
  }
};

exports.getAllTypes = async (req, res, next) => {
  try {
    const types = await Type.find();
    res.status(200).json(types);
  } catch (error) {
    res.status(400).json({
      message: "No types found",
      error: error.message,
    });
  }
};

exports.getTypeById = async (req, res, next) => {
  try {
    const { typeId } = req.params;
    const type = await Type.findById(typeId);
    res.status(200).json(type);
  } catch (error) {
    res.status(400).json({
      message: "No type found",
      error: error.message,
    });
  }
};

exports.updateType = async (req, res, next) => {
  try {
    const { typeId } = req.params;
    const { name } = req.body;
    const type = await Type.findByIdAndUpdate(typeId, { name }, { new: true });
    res.status(200).json(type);
  } catch (error) {
    res.status(400).json({
      message: "No type found",
      error: error.message,
    });
  }
};

exports.deleteType = async (req, res, next) => {
  try {
    const { typeId } = req.params;
    await Type.findByIdAndDelete(typeId);
    res.status(200).json({ message: "Type deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: "No type found",
      error: error.message,
    });
  }
};
