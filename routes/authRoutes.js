import express from "express";
import {loginController,signupController, preferncesController, messageController } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/jwt.js";
const authRouter = express.Router();

authRouter.post('/login',loginController);
authRouter.post('/signup',signupController);
authRouter.patch('/users/preferences',authenticateUser,preferncesController);
authRouter.patch('/users/messages',authenticateUser,messageController);

export default  authRouter;