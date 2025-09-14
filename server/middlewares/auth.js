import jwt from "jsonwebtoken";

// Middleware to authenticate user using JWT token to fetch clerk id

const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.decode(token);

    if (!decodedToken || !decodedToken.clerkId) {
      return res.status(401).json({ success: false, message: "Invalid token or missing clerkId" });
    }
    req.user = { clerkId: decodedToken.clerkId }; // <-- Fix: set req.user
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authUser;
