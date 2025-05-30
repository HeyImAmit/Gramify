import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";

const userRouter = express.Router();
userRouter.post("/login", loginUser);
userRouter.post("/signup", registerUser);
export default userRouter;