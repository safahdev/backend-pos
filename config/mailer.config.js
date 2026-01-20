const nodemailer = require('nodemailer')

const trasnporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

const sendEmailOtp = async (email, otp) => {
    await trasnporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP Reset Password',
        text: `Kode OTP kamu : ${otp}`
    })
}

module.exports = sendEmailOtp
