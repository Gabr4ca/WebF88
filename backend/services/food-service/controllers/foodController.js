import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";

// add food items

const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`;
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await food.save();
      res.json({success: true, message: "Food Added"});
    } else {
      res.json({success: false, message: "You are not admin"});
    }
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

// all foods for users (only active items)
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({isDeleted: {$ne: true}});
    res.json({success: true, data: foods});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

// all foods for admin (including hidden items)
const listAllFood = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const foods = await foodModel.find({});
      res.json({success: true, data: foods});
    } else {
      res.json({success: false, message: "You are not admin"});
    }
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

// toggle food visibility
const toggleFoodVisibility = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const food = await foodModel.findById(req.body.id);
      const newStatus = !food.isDeleted;
      await foodModel.findByIdAndUpdate(req.body.id, {isDeleted: newStatus});
      res.json({success: true, message: newStatus ? "Food Hidden" : "Food Visible"});
    } else {
      res.json({success: false, message: "You are not admin"});
    }
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

export {addFood, listFood, listAllFood, toggleFoodVisibility};
