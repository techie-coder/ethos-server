const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

const User = require("../models/user");
const { secureOTP, sendOTP } = require("../utils/otpsender");
const authenticate = require('../middleware/authenticate');

dotenv.config()

router.post("/generate-otp", async (req, res) => {
  const email = req.body.email;

  try {
    let user = await User.findOne({ email: email });

    // If user does not exist, create a new user
    if (!user) {
      user = new User({ email: email });
    }

    // If user is blocked, return an error
    if (user.isBlocked) {
      const currentTime = new Date();
      if (currentTime < user.blockUntil) {
        return res.status(403).json({message: "Account blocked. Try after some time."});
      } else {
        user.isBlocked = false;
        user.OTPAttempts = 0;
      }
    }

    // Check for minimum 1-minute gap between OTP requests
    const lastOTPTime = user.OTPCreatedTime;
    const currentTime = new Date();

    if (lastOTPTime && currentTime - lastOTPTime < 60000) {
      return res
        .status(403)
        .json({message: "Minimum 1-minute gap required between OTP requests"});
    }

    const OTP = secureOTP();
    user.OTP = OTP;
    user.OTPCreatedTime = currentTime;

    await user.save();

    sendOTP(email, OTP);

    res.status(200).json({message: "OTP sent successfully"});
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const OTP = req.body.OTP;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    // Check if user account is blocked
    if (user.isBlocked) {
      const currentTime = new Date();
      if (currentTime < user.blockUntil) {
        return res.status(403).json({message: "Account blocked. Try after some time."});
      } else {
        user.isBlocked = false;
        user.OTPAttempts = 0;
      }
    }

    // Check OTP
    if (user.OTP !== OTP) {
      user.OTPAttempts++;

      // If OTP attempts >= 5, block user for 1 hour
      if (user.OTPAttempts >= 5) {
        user.isBlocked = true;
        let blockUntil = new Date();
        blockUntil.setHours(blockUntil.getHours() + 1);
        user.blockUntil = blockUntil;
      }

      await user.save();

      return res.status(403).json({message: "Invalid OTP"});
    }

    // Check if OTP is within 5 minutes
    const OTPCreatedTime = user.OTPCreatedTime;
    const currentTime = new Date();

    if (currentTime - OTPCreatedTime > 5 * 60 * 1000) {
      return res.status(403).json({message: "OTP expired"});
    }

    // Generate JWT
    const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    // Clear OTP
    user.OTP = undefined;
    user.OTPCreatedTime = undefined;
    user.OTPAttempts = 0;

    await user.save();
    res.json({ token: token });
    console.log("User logged in successfully");
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Server error"});
  }
});

router.post('/refresh-token', authenticate, async (req, res) => {
    email = req.email;

    try{
        let user = await User.findOne({email: email})
        if(user){
            const token = jwt.sign({email: email}, process.env.SECRET_KEY, { expiresIn: "30d" })
            res.status(200).json({ token: token });
            console.log('Refresh token generated!')
        }else{
            res.status(401).send("User not found!")
        }
    }catch(err){
        res.status(500).send("Error while getting refresh token")
    }
})


router.get('/get-email', authenticate, (req, res) => {
  const email = req.email;
  res.status(200).json({email: email});
})


module.exports = router;

