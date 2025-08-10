import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatRouter from "./routes/chatRoutes.js";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// === Middlewares ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://agent-mira-frontend.vercel.app',
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


//Routes
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
app.use("/api", chatRouter);
app.use("/api", authRouter);


export default app;
