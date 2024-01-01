const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const localStorage = require("localStorage");

const secretKey = crypto.randomBytes(32).toString("hex");

const generateToken = (userId) => {
  return jwt.sign({ userId }, secretKey, { expiresIn: "1000h" });
};
localStorage.getItem("jwtToken");
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    req.userId = decoded.userId;

    req.secretKey = secretKey;

    next();
  });
  localStorage.setItem("jwtToken", token);
};

// Export the secretKey for use in other files
module.exports = { verifyToken, generateToken };
