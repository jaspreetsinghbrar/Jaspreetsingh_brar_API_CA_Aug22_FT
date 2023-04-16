const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
require('dotenv').config();
const db = require('../models/index');

const validateEmail = (_email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(_email);
}

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await db.User.findOne({ where: { email: email } });

    if (!validateEmail(email)) {
      return res.status(500).json({
        status: "fail",
        message: "Email Not Valid"
      });
    }

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Username already taken"
      });
    }
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    await db.User.create({ name: username, email: email, encryptedPassword: hashedPassword, salt: salt });
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {

    if (!validateEmail(email)) {
      return res.status(500).json({
        status: "fail",
        message: "Email Not Valid" 
      });
    }

    const user = await db.User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid username" 
      });
    }

    const salt = user.salt.toString();

    const savedPassword = user.encryptedPassword.toString();

    const hashedPassword = await bcrypt.hash(password, salt);

    const passwordMatch = (hashedPassword === savedPassword);

    if (!passwordMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid password" 
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    res.cookie('token', token);
    res.cookie('userId', user.id);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: 'Internal server error' });
  }
};