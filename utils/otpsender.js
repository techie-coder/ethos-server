const crypto = require('crypto')
const nodemailer = require('nodemailer');

const secureOTP = () => crypto.randomInt(100000, 999999).toString()

const sendOTP = (email, otp) => {
    const sender = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_SERVICE_USER,
            pass: process.env.EMAIL_SERVICE_PASS,
        },
    })

    const mailOptions = {
        from: process.env.EMAIL_SERVICE_USER,
        to: email,
        subject: "Your OTP for ethos",
        text: `Your OTP for signing in to ethos is ${otp}`
    }

    sender.sendMail(mailOptions, (error, info) => {
        if(error) console.log(error)
        else console.log("Email sent: " + info.response)
    })
}

module.exports = { secureOTP, sendOTP };