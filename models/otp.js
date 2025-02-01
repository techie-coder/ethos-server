const { default: mongoose } = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
})

const Otp = new mongoose.Model("Otp", otpSchema)
module.exports = Otp;