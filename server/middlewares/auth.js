import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.decode(token);

    if (!decodedToken || !decodedToken.sub) {
      return res.status(401).json({ success: false, message: "Invalid token or missing user ID" });
    }

    // Clerk user ID is in `sub`
    req.user = { clerkId: decodedToken.sub };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authUser;
