const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ["account_verification", "eventBooking"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
})

module.exports = mongoose.model('OTP', otpSchema)