import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// import bodyParser from "body-parser";
import chatRouter from "./routes/chatRoutes.js";
import authRouter from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// === Middlewares ===
// Parses incoming JSON requests
app.use(express.json());

// Parses URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());
// app.use(bodyParser);


// Health check route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
app.use("/api",chatRouter);
app.use("/api",authRouter);



export default app;
