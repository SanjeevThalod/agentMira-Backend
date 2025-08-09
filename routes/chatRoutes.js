import express from "express";
import { allData, interpretUserInput, customData } from "../controllers/chatController.js";

const chatRouter = express.Router();


chatRouter.get("/data",allData);
chatRouter.post("/input",interpretUserInput);
chatRouter.post("/customData",customData);

export default chatRouter;