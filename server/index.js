const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const app = express()
const mongoose = require('mongoose')
const authRoutes = require('./routes/auth')
const eventRoutes = require('./routes/event')
const bookingRoutes = require('./routes/booking')

app.use(cors())
app.use(express.json())

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/event', eventRoutes) // Backward compatibility for existing clients
app.use('/api/bookings', bookingRoutes)
app.use('/api/booking', bookingRoutes) // Backward compatibility for existing clients

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log('Connected to Mongo Db')
}).catch((err) => {
    console.log(err)
}) 
const PORT = process.env.PORT || 5000;


app.listen(PORT, ()=> {
    console.log('Server is running')
})
