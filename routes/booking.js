
const express = require('express');
const qrcode=require('qrcode');
const router = express.Router();
const Concert = require('../models/ConcertModel'); 
const Booking = require('../models/bookingModel'); 
const User=require('../models/userModel');
const { error } = require('console');
const ejs= require('ejs');
const fs = require('fs').promises;
const pdf = require ('html-pdf-node');
const nodemailer = require('nodemailer');



console.log(' Booking routes loaded');

function isAuthenticated(req, res, next) {
  console.log(' Checking if user is authenticated...');
  if (req.session && req.session.userId) {
    console.log(' Authenticated user ID:', req.session.userId);
    return next();
  }
  console.log('Not authenticated. Redirecting to Concert Page');
  res.redirect('./userconcert');
}



router.get('/booking/:concertId',isAuthenticated, async (req, res) => {
  const concertId = req.params.concertId;
  const userId = req.session.userId;

  try {
    const concert = await Concert.findById(concertId);
    const user= await User.findById(userId);
    if (!concert) return res.status(404).send('Concert not found');

    // Find how many tickets the user has already booked
    const booking = await Booking.findOne({ user: userId, concert: concertId });
    const alreadyBooked = booking ? booking.quantity : 0;

    res.render('booking', {
      title: 'Booking',
      concert,
      alreadyBooked,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});




// POST /booking/:concertId
router.post('/booking/:concertId',isAuthenticated, async (req, res) => {
  const concertId = req.params.concertId;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).send('User not logged in');
  }
  
  const quantity = parseInt(req.body.quantity, 10);

  if (quantity <= 0) {
    return res.status(400).send('Quantity must be at least 1');
  }

  try {
    const concert = await Concert.findById(concertId);
    if (!concert) return res.status(404).send('Concert not found');

    // Find existing booking for this user and concert
    let booking = await Booking.findOne({ user: userId, concert: concertId });

    const alreadyBooked = booking ? booking.quantity : 0;

    if (alreadyBooked + quantity > 3) {
      return res.status(400).send('You can only book a maximum of 3 tickets per concert');
    }

    if (concert.AvailableTickets < quantity) {
      return res.status(400).send('Not enough tickets available');
    }

    // Update or create booking
    if (booking) {
      booking.quantity += quantity;
    } else {
      booking = new Booking({
        user: userId,
        concert: concertId,
        quantity,
      });
    }
    await booking.save();

    // Reduce available tickets in concert
    concert.AvailableTickets -= quantity;
    await concert.save();
    res.render('./bookingconfirmed',{concert,booking});
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

router.get('/bookingconfirmed', async(req,res)=>{
try{
  const bookingId = req.params.id;
  const booking=await Booking.findById(bookingId).populate('concert','user');

  
  if (!booking) {
    return res.status(404).send('Booking not found');
  }
  console.log(booking);
  // Pass booking as an object to the view
  res.render('bookingconfirmed', {booking,concert:booking.concert});
}
catch(error){
  console.error(error);
  res.status(500).send("Server Error");
}
});

router.get('/generate-pdf/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Fetch booking with populated concert and user
    const booking = await Booking.findById(bookingId)
      .populate('concert')
      .populate('user');

    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    // Read and render EJS template
    const template = await fs.readFile('./views/booking_template.ejs', 'utf8');
    const html = ejs.render(template, { 
      booking,
      concert: booking.concert,
      user: booking.user 
    });

    // Generate PDF
    const pdfBuffer = await pdf.generatePdf({ content: html }, { format: 'A4' });

    // Send PDF as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="booking_${booking._id}.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});






router.get('/booking_mail/:id', async (req, res) => {
  try {
    // Assuming you have a Product model or equivalent
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId)
    .populate('concert')
    .populate('user');

    // Create a nodemailer transport object
    // replace this with your copied code
    // Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "8e799537fd9e9a",
    pass: "ff35d398935099"
  }
});


    const template = await fs.readFile('./views/booking_mail.ejs', 'utf8');
    // Email content
    const mailOptions = {
      from: 'user123@gmail.com', // Sender email address
      to: 'your_mailtrap_inbox@mailtrap.io', // Receiver email address
      subject: `New Booking: ${booking.id}`, // Email subject
      html: ejs.render(template, { booking,concert:booking.concert,user:booking.user }) // Render HTML using EJS
    };


    // Send the email
    const info = await transport.sendMail(mailOptions);
    console.log('Email sent:', info.response);


    // Close the transport after sending the email
    transport.close();


  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/QR-code/:id',async(res,req)=>{
  const url="http://localhost:5000/generate-pdf/:id"

  qrcode.toString('url',(err,qrCodeUrl)=>{
  res.status(200).json(url);
  })
})
module.exports = router;