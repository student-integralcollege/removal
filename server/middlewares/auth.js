import jwt from "jsonwebtoken";

// Middleware to authenticate user using JWT token to fetch clerk id

const authUser = (req, res, next) => {
  try {
    // Get token from 'authorization' header (Bearer <token>)
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(' ')[1];

    // Verify token (replace 'your_jwt_secret' with your actual secret if needed)
    const decodedToken = jwt.decode(token);
    // If you want to verify signature, use jwt.verify(token, secret)
    // const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken || !decodedToken.clerkId) {
      return res.status(401).json({ success: false, message: "Invalid token or missing clerkId" });
    }
    req.body.clerkId = decodedToken.clerkId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authUser;
