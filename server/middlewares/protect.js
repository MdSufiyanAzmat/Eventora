const jwt = require('jsonwebtoken')
const User = require('../models/user')

const protect = async (req, res, next)=> {
    let token = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1] : null;

    if(token){
        try{
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            req.user = await User.findById(decoded.id).select('-password')
            if(!req.user){
                return res.status(400).json({message: "Not authorized! User not found."})
            }
            next()
        }catch(error){
            return res.status(400).json({message: "Token failed"})
        }
    }else{
        return res.status(400).json({message: "No token found"})
    }
}

const admin = async (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next()
    }else{
        return res.status(403).json({message: "Access denied! Admin access required."})
    }
}

module.exports = {protect, admin}
