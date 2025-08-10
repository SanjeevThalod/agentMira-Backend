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
  'http://localhost:3000',
  'http://localhost:5173',
  'https://agent-mira-frontend.vercel.app',
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


//Routes
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
app.use("/api", chatRouter);
app.use("/api", authRouter);


export default app;
