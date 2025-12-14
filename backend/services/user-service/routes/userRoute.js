import express from "express";
import {
  loginUser,
  registerUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/list", authMiddleware, getAllUsers);
userRouter.post("/update-role", authMiddleware, updateUserRole);
userRouter.post("/update-status", authMiddleware, updateUserStatus);
userRouter.post("/delete", authMiddleware, deleteUser);

export default userRouter;
