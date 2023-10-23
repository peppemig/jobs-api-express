const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError("Please provide all informations");
  }

  const emailIsTaken = await User.findOne({ email: email });

  if (emailIsTaken) {
    throw new BadRequestError("An account with this email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);

  const tmpUser = {
    name: name,
    email: email,
    password: hashedPass,
  };

  const user = await User.create({ ...tmpUser });

  const token = jwt.sign(
    { userId: user._id, name: user.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );

  res.status(StatusCodes.CREATED).json({ token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide all credentials");
  }

  const userExists = await User.findOne({ email: email });

  if (!userExists) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, userExists.password);

  if (!isPasswordValid) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: userExists._id, name: userExists.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );

  res.status(StatusCodes.OK).json({ token });
};

module.exports = { register, login };
