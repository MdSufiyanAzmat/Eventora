const Booking = require('../models/booking')
const Otp = require('../models/OTP')
const Event = require('../models/event')
const {sendOtpEmail, sendBookingEmail} = require('../utils/email')

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendBookingOtp = async (req, res) => {
    try{
        const otp = generateOtp()
        await Otp.findOneAndDelete({email: req.user.email, action: 'eventBooking'})
        await Otp.create({email: req.user.email, otp, action: 'eventBooking'})
        await sendOtpEmail(req.user.email, otp, 'eventBooking')
        res.json({message: 'otp send to email'})
    }catch(error){
        return res.status(500).json({error: error.message})
    }
}

exports.bookEvent = async (req, res) => {
    try {
        const {eventId, otp} = req.body;
        const otpRecord = await Otp.findOne({email: req.user.email, otp, action: 'eventBooking'})
        if(!otpRecord) {
            return res.status(400).json({message: 'Invalid or expired otp'})
        }
        const event = await Event.findById(eventId)
        if(!event){
            return res.status(404).json({message: 'Event does not exist'})
        }
        if(event.availableSeats <= 0){
            return res.status(400).json({message: 'Seats are full'})
        }
        const existingBooking = await Booking.findOne({
            userId: req.user._id,
            eventId: event._id,
            status: {$in: ['pending', 'confirmed']}
        })
        if(existingBooking){
            return res.status(400).json({message: 'Already booked'})
        }

        const booking = await Booking.create({
            userId: req.user._id,
            eventId: event._id,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        })

        await Otp.deleteMany({email: req.user.email, action: 'eventBooking'})
        res.status(201).json({message: 'Booking request created.', booking})
    } catch (error) {
        return res.status(500).json({message: 'Unable to create booking', error: error.message})
    }
}


exports.confirmBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('eventId userId')
    if(!booking){
        return res.status(401).json({message: "Booking does not exist"})
    }
    if(booking.status === 'confirmed'){
        return res.status(400).json({message: "Already booked"})
    }

    const event = await Event.findById(booking.eventId._id)
    if(!event || event.availableSeats <= 0){
        return res.status(400).json({message: 'Seats not available.'})
    }
    booking.status = 'confirmed'
    booking.paymentStatus = req.body.paymentStatus === 'paid' ? 'paid' : 'not_paid'
    await booking.save()
    event.availableSeats -= 1;
    await event.save()
    await sendBookingEmail(booking.userId.email, booking.userId.name, event.title)
    res.json({message: "booking confirmed"})
}

exports.getAllBookings = async (req, res) => {
    const bookings = await Booking.find()
        .populate('eventId')
        .populate('userId', 'name email')
        .sort({createdAt: -1})
    res.json(bookings)
}

exports.getMyBooking = async (req, res) => {
    const bookings = await Booking.find({userId: req.user._id})
        .populate('eventId')
        .sort({createdAt: -1})
    res.json(bookings)
}

exports.deleteBooking = async (req, res) => {
    const bookings = await Booking.findById(req.params.id)
    if(!bookings){
        return res.status(404).json({message: 'booking not found'})
    }
    if(req.user.role !== 'admin' && bookings.userId.toString() !== req.user._id.toString()){
        return res.status(403).json({message: "unauthorized"})
    }

    const wasConfirmed = bookings.status === 'confirmed'
    bookings.status = 'cancelled'
    await bookings.save()
    if(wasConfirmed){
        const event = await Event.findById(bookings.eventId)
        if (event) {
            event.availableSeats += 1
            await event.save()
        }
    }
    res.json({message: "booking cancelled"})
}
