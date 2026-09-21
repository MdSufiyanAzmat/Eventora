const express = require('express')
const router = express.Router()
const {bookEvent, getAllBookings, getMyBooking, sendBookingOtp, confirmBooking, deleteBooking} = require('../controllers/bookingController')
const {protect, admin} = require('../middlewares/protect')

router.post('/', protect, bookEvent)
router.get('/', protect, admin, getAllBookings)
router.get('/my', protect, getMyBooking)
router.post('/send-otp', protect, sendBookingOtp)
router.post('/sendOtp', protect, sendBookingOtp) // Backward compatibility
router.put('/:id/confirm', protect, admin, confirmBooking)
router.delete('/:id', protect, deleteBooking)

module.exports = router
