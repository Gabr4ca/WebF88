import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// login user

const loginUser = async (req, res) => {
  const {email, password} = req.body;
  try {
    const user = await userModel.findOne({email});
    if (!user) {
      return res.json({success: false, message: "User Doesn't exist"});
    }
    // Check if user is deactivated
    if (user.status === "deactivated") {
      return res.json({success: false, message: "Account has been deactivated"});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({success: false, message: "Invalid Credentials"});
    }
    const role = user.role;
    const token = createToken(user._id);
    res.json({success: true, token, role});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

// Create token

const createToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET);
};

// register user

const registerUser = async (req, res) => {
  const {name, email, password} = req.body;
  try {
    // checking user is already exist
    const exists = await userModel.findOne({email});
    if (exists) {
      return res.json({success: false, message: "User already exists"});
    }

    // validating email format and strong password
    if (!validator.isEmail(email)) {
      return res.json({success: false, message: "Please enter valid email"});
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter strong password",
      });
    }

    // hashing user password

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const role = user.role;
    const token = createToken(user._id);
    res.json({success: true, token, role});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const adminUser = await userModel.findById(req.body.userId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.json({success: false, message: "Not authorized"});
    }
    const users = await userModel.find({}).select("-password").sort({createdAt: -1});
    res.json({success: true, data: users});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error fetching users"});
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  const {userId, role} = req.body;
  try {
    const adminUser = await userModel.findById(req.body.userId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.json({success: false, message: "Not authorized"});
    }
    if (!["user", "admin"].includes(role)) {
      return res.json({success: false, message: "Invalid role"});
    }
    await userModel.findByIdAndUpdate(userId, {role});
    res.json({success: true, message: "Role updated successfully"});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error updating role"});
  }
};

// Update user status (admin only)
const updateUserStatus = async (req, res) => {
  const {userId, status} = req.body;
  try {
    const adminUser = await userModel.findById(req.body.userId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.json({success: false, message: "Not authorized"});
    }
    if (!["active", "deactivated"].includes(status)) {
      return res.json({success: false, message: "Invalid status"});
    }
    await userModel.findByIdAndUpdate(userId, {status});
    res.json({success: true, message: "Status updated successfully"});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error updating status"});
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  const {userId} = req.body;
  try {
    const adminUser = await userModel.findById(req.body.userId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.json({success: false, message: "Not authorized"});
    }
    await userModel.findByIdAndDelete(userId);
    res.json({success: true, message: "User deleted successfully"});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error deleting user"});
  }
};

export {loginUser, registerUser, getAllUsers, updateUserRole, updateUserStatus, deleteUser};
