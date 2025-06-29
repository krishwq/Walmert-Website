const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
require('dotenv').config(); 
const jwt_secret = process.env.JWT_SECRET;

// Route 1: Create user
router.post(
  "/createuser",
  [
    body("firstname").isLength({ min: 3 }).withMessage("Firstname should have at least 3 characters"),
    body("lastname").isLength({ min: 3 }).withMessage("Lastname should have at least 3 characters"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 8 }).withMessage("Password should have at least 8 characters"),
    body("gender").notEmpty().withMessage("Gender is required"),
    body("mobile").isLength({ min: 10, max: 10 }).isNumeric().withMessage("Valid 10-digit mobile number required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("pin").isLength({ min: 6, max: 6 }).isNumeric().withMessage("PIN must be 6 digits"),
    body("country").notEmpty().withMessage("Country is required")
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      const { firstname, middlename, lastname, email, password, gender, mobile, address, state, pin, country } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success, errors: "Email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      user = await User.create({
        firstname,
        middlename,
        lastname,
        email,
        password: secPass,
        gender,
        mobile,
        address,
        state,
        pin,
        country,
        cart: []
      });

      const data = {
        user: {
          id: user.id
        }
      };

      const authtoken = jwt.sign(data, jwt_secret);
      success = true;
      res.json({ success, authtoken });

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Route 2: Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").exists().withMessage("Password cannot be blank")
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success, errors: "Incorrect credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success, errors: "Incorrect credentials" });
      }

      const data = {
        user: {
          id: user.id
        }
      };

      const authtoken = jwt.sign(data, jwt_secret);
      success = true;
      res.json({ success, authtoken });

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Route 3: Get user details (login required)
router.get("/getuser", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});

// Route 4: Update user cart (login required)
router.put("/updatecart", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cart } = req.body;

    if (!Array.isArray(cart)) {
      return res.status(400).json({ error: "Cart should be an array" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { cart },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
