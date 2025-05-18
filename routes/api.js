
var express = require('express');
var router = express.Router();
const Booking=require('../models/bookingModel')
const Concert = require('../models/ConcertModel');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
var express = require('express');
const bcrypt = require('bcrypt');
const { validationResult, check } = require('express-validator');
const ejs= require('ejs');
const fs = require('fs').promises;
const pdf = require ('html-pdf-node');
const nodemailer = require('nodemailer');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); // Make sure this path exists
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });



function isAuthenticated(req, res, next) {
  console.log(' Checking if user is authenticated...');
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(500).json({message:'Not authenticated. Please Authenticate first.'});
  res.redirect('./userconcert');
}



router.post('/concert_create',upload.single('image'),(req, res) => {

  const { ConcertName, Date, Venue, TicketPrice, AvailableTickets } = req.body;
  const image= req.file?req.file.filename:null;
  console.log(image);
  

  const concert = new Concert({ 
      ConcertName, 
      Date, 
      Venue, 
      TicketPrice,
      AvailableTickets,
      image      
      });
  const validationError = concert.validateSync();
  if (validationError) {
      res.status(500).json({error: validationError.errors})
  } else {
      concert.save().then(() => {
              res.status(200).json({message:"Created"});
          }).catch((error) => {
            res.status(500).json({message:"Internal Server Error"})          
          });
 }
})


  router.get('/concert_retrieve',(req, res) => {

    Concert.find().then(data => {
      const serializedData = data.map(concert=>({
        id:concert._id,
        concertname:concert.ConcertName,
        date:concert.Date, 
      venue:concert.Venue, 
      ticketprice:concert.TicketPrice,
      AvailableTickets:concert.AvailableTickets,
      image:concert.image   
      }));
      res.status(200).json({data:serializedData})  
    }).catch(error => {
      return res.status(500).json({ messgae:"Server Error" });      
    });
  
  });



   router.put('/concert_update/:id',upload.single('image'),(req, res) => {
        const concertId = req.params.id;
        const { ConcertName, Date, Venue, TicketPrice, AvailableTickets } = req.body;
        const image= req.file?req.file.filename:null;
            console.log(image);
        const concert = new Concert({ 
            ConcertName, 
            Date, 
            Venue, 
            TicketPrice,
            AvailableTickets,
            image
            });
            


        const validationError = concert.validateSync();
        if (validationError) {
            // If there are validation errors, re-render the form with error messages
            res.status(304).json({concert:concert,error: validationError.errors})
    
    
        } else {
        Concert.findByIdAndUpdate(
            concertId,
            { ConcertName, Date, Venue, TicketPrice, AvailableTickets,image }
          )
            .then(() => {
              res.status(200).json({message:"Updated Successfully!!!"}); // Redirect to the concert list after updating
            })
            .catch(error => {
              return res.status(500).json({ message:"Internal Server Error" });
            });
        }
    })



    router.delete('/concert_delete/:id',(req, res) =>{
          const concertId = req.params.id;
          Concert.findByIdAndDelete(concertId)
              .then(() => {
                res.status(200).json({message:"Deleted!!!"}); // Redirect to the concert list after deleting
              })
              .catch(error => {
                res.status(500).json({ message: 'Internal Server Error' });              });
      })




      router.post(
        '/signup',
        [
          check('Email').isEmail().withMessage('Invalid email address'),
          check('Password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
        ],
        async (req, res) => {
          const { Name, Email, Password, ConfirmPassword, Role } = req.body;
          
          // Check validation errors
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            res.status(400).json({
              message: 'Validation error',
              errors: errors.array(),
            });
          }
      
          // Check if passwords match
          if (Password !== ConfirmPassword) {
            res.status(401).json({
              message:'Password and Confirm Password do not match',
            });
              
          }
      
          try {
            // Check if user already exists
            const existingUser = await User.findOne({ Email });
            if (existingUser) {
              return res.status(409).json({
                message: 'Email already taken',
                errors: [],
              });
            }
      
            // Hash password
            const hashedPassword = await bcrypt.hash(Password, 10);
      
            // Create and save new user
            const newUser = new User({ Name, Email, Password: hashedPassword, Role });
            await newUser.save();
      
            // Redirect to login page
            res.status(200).json({message:"Signed UP"})
          } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
          }
        }
      );
      



      router.post(
        '/userlogin',
        [
          check('Email').isEmail().withMessage('Invalid email address'),
          check('Password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
        ],
        async (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            res.status(400).json({
              message: 'Validation error',
              errors: errors.array(),
            });
          }
      
          const { Email, Password } = req.body;
      
          try {
            // Find user by email
            const user = await User.findOne({ Email: Email });
            if (!user) {
              return res.status(401).json({
                message: 'Incorrect Email Address.',
                errors: [],
              });
            }
      
            // Compare passwords
            const isPasswordValid = await bcrypt.compare(Password, user.Password);
      
            if (!isPasswordValid) {
              return res.status(401).json({message:"Incorrect Password!"})
            }
      
              if (user.Role === 'User') {
                Concert.find().then(data => {
                  req.session.userId = user._id;
                  res.status(200).json({message:"Logged IN!!"})
                }).catch(error => {
              
                  console.error(error);
                  
                });
              } else {
                res.status(200).json({message:"Admin Logged IN!!"})
              }
          } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
          }
        }
      );



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
    res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});


module.exports=router;