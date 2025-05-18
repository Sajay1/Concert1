
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  concert: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert', required: true },
  quantity: { type: Number, required: true },
});

bookingSchema.index({ user: 1, concert: 1 }, { unique: true }); // Prevent duplicate bookings

module.exports = mongoose.model('Booking', bookingSchema);
