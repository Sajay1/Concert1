
const mongoose = require("mongoose");


const concertSchema = new mongoose.Schema({
    ConcertName: {
        type: String,
        required: [true, 'ConcertName is required'],
        maxlength: [500, 'ConcertName cannot exceed 500 characters']
    },
    Date: {
        type: Date,
        required: [true, 'Date is required']
    },
    Venue: {
        type: String,
        required: [true, 'Venue is required'],
    },
    TicketPrice: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    AvailableTickets: {
        type: Number,
        required: [true, 'Tickets is required'],
    },
    image: {
        type: String,
        required:true
      }   
});

const Concert = mongoose.model('Concert', concertSchema);
module.exports = Concert;