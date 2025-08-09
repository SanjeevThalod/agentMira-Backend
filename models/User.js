import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    location: { type: String, default: null },
    amenities: { type: [String], default: [] },
    min_bedrooms: { type: Number, default: null },
    max_bedrooms: { type: Number, default: null },
    min_bathrooms: { type: Number, default: null },
    max_bathrooms: { type: Number, default: null },
    min_size_sqft: { type: Number, default: null },
    max_size_sqft: { type: Number, default: null },
    min_price: { type: Number, default: null },
    max_price: { type: Number, default: null }
  }
});

const User = mongoose.model("User",userSchema);

export default User;

