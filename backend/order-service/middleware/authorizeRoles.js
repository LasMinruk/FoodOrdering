const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || "";

    // Allow internal service requests to pass (Internal token)
    if (authHeader.startsWith("Internal ")) {
      return next();
    }

    // Normal user authentication and role checking
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions." });
    }

    next();
  };
};

export default authorizeRoles;