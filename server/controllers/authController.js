const User = require('../models/user')
const OTP = require('../models/OTP')
const {sendOtpEmail} = require('../utils/email')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const generateToken = (id, role) => {
    return jwt.sign({id, role}, process.env.SECRET_KEY, {expiresIn: '7d'})
}


//Register user
exports.registerUser = async (req, res) => {
    const {name, email, password, role = 'user', adminRegistrationCode} = req.body
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({message: 'Please choose a valid account type.'})
    }

    if (role === 'admin' && (
        !process.env.ADMIN_REGISTRATION_CODE ||
        adminRegistrationCode !== process.env.ADMIN_REGISTRATION_CODE
    )) {
        return res.status(403).json({message: 'A valid admin registration code is required.'})
    }

    let userExists = await User.findOne({email})
    if(userExists){
        return res.status(400).json({error: "User already exists."})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword =  await bcrypt.hash(password, salt)
    
    try{
        const user = await User.create({name, email, password: hashedPassword, role, isVerified: false})

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        await OTP.create({email, otp, action: 'account_verification'})
        await sendOtpEmail(email, otp, 'account_verification')

        res.status(201).json({message: "User registered Successfully. Please check your email for otp verification.",
            email: user.email
        })

    }catch(error){
        res.status(400).json({error: error.message})
    }
}

//login user
exports.loginUser = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})
    if(!user) {
        return res.status(400).json({message: "Email doesn't exist."})
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return res.status(400).json({message: "Wrong password."})
    }

    if(!user.isVerified){
        const otp = Math.floor(100000 + Math.random() * 900000);
        await OTP.deleteMany({email, action: 'account_verification'})
        await OTP.create({email, otp, action: 'account_verification'})
        await sendOtpEmail(email, otp, 'account_verification')
        return res.status(400).json({
            message: 'Account not verified. A new OTP has been sent to your registered email.',
            needsVerification: true
        })
    }
    res.json({
        message: 'Login Successful!',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
    })
}

exports.verifyOtp = async (req, res) => {
    const {email, otp} = req.body;
    const otpRecord = await OTP.findOne({email, otp, action: 'account_verification'})
    if(!otpRecord){
        return res.status(400).json({message: 'Invalid or otp expired.'})
    }
    const user = await User.findOneAndUpdate({email}, {isVerified: true})
    await OTP.deleteMany({email, action: 'account_verification'})
    res.json({
        message: "Account verified successfully you can log in now.",
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role)
})
}
