const crypto = require('crypto')
const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config()

const secureOTP = () => crypto.randomInt(100000, 999999).toString()

const sendOTP = (email, otp) => {
    const sender = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_SERVICE_USER,
            pass: process.env.EMAIL_SERVICE_PASS
        },
    })

    const mailOptions = {
        from: process.env.EMAIL_SERVICE_USER,
        to: email,
        subject: "Your Ethos Verification Code",
        text: `Hi, \n\nYour one time verification code for Ethos is:\n\n🔒${otp}\n\nThis code will expire in 5 minutes. Please enter it on the Ethos app to proceed.\n\nIf you didn't request this code, please ignore this email. For assistance, email to this same mail.\n\nBest,\nThe Ethos Team`
    }

    sender.sendMail(mailOptions, (error, info) => {
        if(error) console.log(error)
        else console.log("Email sent: " + info.response)
    })
}

module.exports = { secureOTP, sendOTP };