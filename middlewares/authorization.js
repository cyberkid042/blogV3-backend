const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers?.token;

  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];

      const userId = jwt.verify(token, process.env.JWT_SECRET);

      if (!userId)
        return res.status(403).json("The provided Token is not valid!");

      const user = await User.findById(userId).select("-password");

      req.user = user;

      next();
    } catch (error) {
      res
        .status(500)
        .json(
          `An error occurred while processing your request. Please login again! `
        );
    }
  } else {
    return res.status(401).json("Please authenticate to continue!");
  }
};

const verifyTokenAndAuthorize = async (req, res, next) => {
  await verifyToken(req, res, () => {
    if (req?.user?.id === req?.body?.userId || req?.user?.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not allowed to complete this request");
    }
  });
};

const verifyTokenAndIsAdmin = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req?.user?.isAdmin) {
      next();
    } else {
      return res.status(403).json("You are not allowed to access this section");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorize,
  verifyTokenAndIsAdmin,
};
