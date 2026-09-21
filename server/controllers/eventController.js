const Event = require('../models/event')

exports.getAllEvents = async (req, res) => {
    try {
        const filters = {}
        if (req.query.location) {
            filters.location = req.query.location
        }
        if (req.query.ticketPrice) {
            filters.ticketPrice = req.query.ticketPrice
        }
        const events = await Event.find(filters)
        res.json(events)
    } catch (error) {
        return res.status(500).json({ message: "Can not find all the events" })
    }
}

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
        if (!event) {
            return res.status(500).json({ message: "Event not found" })
        }
        res.json(event)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.createEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;

    try {
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            ticketPrice,
            imageUrl,
            availableSeats: totalSeats,
            createdBy: req.user._id
        })
        res.status(201).json(event)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.updateEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;
    try {
        const event = await Event.findByIdUpdate(req.params.id, {
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            ticketPrice,
            imageUrl
        }, {new: true})
        if(!event){
            return res.status(404).json({error: 'Event not found'})
        }
        res.json(event)
    }catch(error){
        return res.status(500).json({error: error.message})
    }
}

exports.deleteEvent = async (req, res) => {
    try{
        const events = await Event.findByIdAndDelete(req.params.id)
        if(!events){
            return res.status(404).json({message: "Event does not exists."})
        }
    }catch(error){
        return res.status(500).json({error: error.message})
    }
}
