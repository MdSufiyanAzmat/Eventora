// Import required packages
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        // Configure email options
        const mailOptions = {
            from: process.env.EMAIL_USER,           // Sender email
            to: userEmail,                          // FIXED: Was 'email', now using 'userEmail'
            subject: `Booking Confirmed: ${eventTitle}`,  // Email subject
            html: `
                <h2>Booking Confirmed! 🎉</h2>
                <p><strong>Dear ${userName},</strong></p>
                <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
                <p>We look forward to seeing you at the event!</p>
                <br>
                <p>Best regards,<br>Eventora Team</p>
            `  // FIXED: Proper HTML email template
        };
        
        // FIXED: Changed from 'sendEmail' to 'sendMail'
        await transporter.sendMail(mailOptions);
        console.log(`Booking email sent to ${userEmail} for ${eventTitle}`);
        
    } catch (error) {
        console.log('Error sending booking email: ', error);
    }
};

/**
 * Send OTP email for verification
 * @param {string} email - Recipient's email address
 * @param {string} otp - One Time Password
 * @param {string} type - Type of verification ('account_verification' or 'booking_verification')
 */
const sendOtpEmail = async (email, otp, type) => {
    try {
        // Determine email title based on type
        const title = type === 'account_verification' 
            ? 'Verify Your Account' 
            : 'Eventora Booking Verification';
        
        // Determine email message based on type
        const msg = type === 'account_verification'
            ? 'Please use the following OTP to verify your new Eventora account'
            : 'Please use the following OTP to verify and confirm your event booking';
        
        // Configure email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,                              // Correct: using 'email' parameter
            subject: title,
            html: `
                <h2>${title}</h2>
                <p>${msg}</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
                <br>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>Eventora Team</p>
            `  // FIXED: Proper HTML with OTP highlighted
        };
        
        // FIXED: Changed from 'sendEmail' to 'sendMail'
        await transporter.sendMail(mailOptions);
        
        // FIXED: Console log was using wrong variables (otp, type instead of email, type)
        console.log(`OTP sent to ${email} for ${type}`);
        
    } catch (error) {
        // FIXED: Better error message with actual error details
        console.log(`Unable to send OTP to ${email} for ${type}:`, error);
    }
};

// Export functions for use in other files
module.exports = { sendBookingEmail, sendOtpEmail };