import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

export const authenticateUser = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    // Attach user info to request
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid', err});
  }
};
