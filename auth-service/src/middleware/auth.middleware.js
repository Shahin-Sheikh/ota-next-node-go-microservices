const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Optional: enforce service access if needed
    // if (!VALID_SERVICE_TYPES.includes(decoded.service)) {
    //   return res.status(403).json({ message: "Invalid service access" });
    // }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid", error: err.message });
  }
};

module.exports = authMiddleware;
