const { UnauthenticatedError, BadRequestError } = require("../errors");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Not authenticated");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // check if user with id from payload exists
    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      throw new BadRequestError("User does not exist");
    }

    // attach user to job router
    req.user = { userId: user._id, name: user.name };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Not authenticated");
  }
};

module.exports = auth;
