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
        html: `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-size: 12px; line-height: 1.5; }
                .otp { font-size: 24px; margin-top: 10px; }
                .greeting, .message { margin-top: 10px; }
            </style>
        </head>
        <body>
            <p class="greeting">Hi,</p>
            <p class="message">Your one-time verification code for Ethos is:</p>
            <p class="otp"><b>🔒 <u>${otp}</u></b></p>
            <p class="message">This code will expire in 5 minutes. Please enter it on the Ethos app to proceed.</p>
            <p class="message">If you didn't request this code, please ignore this email. For assistance, email to this same address.</p>
            <p class="message">Best,</p>
            <p><b>The Ethos Team<b></p>
        </body>
    </html>`
    }

    sender.sendMail(mailOptions, (error, info) => {
        if(error) console.log(error)
        else console.log("Email sent: " + info.response)
    })
}

module.exports = { secureOTP, sendOTP };