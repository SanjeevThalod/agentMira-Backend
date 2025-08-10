import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.auth;
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
