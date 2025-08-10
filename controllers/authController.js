import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const cookieOptions = {
  httpOnly: true, 
  secure: process.env.NODE_ENV === "production", 
  sameSite: "none",
  maxAge: 3 * 24 * 60 * 60 * 100
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3h" });

    // Set token as cookie
    
    console.log(process.env.JWT_SECRET, token);
    res.cookie("token", token, cookieOptions);

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "3h" });

    // Set token as cookie
    res.cookie("token", token, cookieOptions);

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const preferncesController = async (req,res)=>{
  try {
    const userId = req.user.id; 
    const preferences = req.body;

    const user = await User.findByIdAndUpdate(userId, { preferences }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Preferences updated', preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export const messageController = async (req,res)=>{
  try {
    const userId = req.user.id;
    const messages = req.body;

    const user = await User.findByIdAndUpdate(userId, {messages},{new:true});
    if(!user) return res.status(404).json({message:"User not Found"});
    res.status(200).json({message:"Updated",messages: user.messages});
  } catch (error) {
    res.status(500).json(error);
  }
}
