import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "https://touching-civet-96.clerk.accounts.dev/.well-known/jwks.json",
  cache: true,
  rateLimit: true,
  jwksRequestsPerMin: 10
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
      if (err || !decodedToken || !decodedToken.sub) {
        console.error("Token verification failed:", err);
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
      }

      // Clerk user ID is in `sub`
      req.user = { clerkId: decodedToken.sub };
      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authUser;
