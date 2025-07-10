import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function authMiddleware(req, res, next) {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Please login and try again." });
  }

  if (token.startsWith("Bearer ")) {
    // Handle normal user authentication
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token!", err });
      }
      req.user = decoded;
      next();
    });
  } else if (token.startsWith("Internal ")) {
    // Handle internal service authentication
    token = token.replace("Internal ", "");
    if (token === process.env.INTERNAL_SECRET) {
      // If token matches internal secret, allow without user data
      next();
    } else {
      return res.status(403).json({ message: "Unauthorized internal request!" });
    }
  } else {
    return res.status(400).json({ message: "Invalid Authorization format!" });
  }
}

export default authMiddleware;
