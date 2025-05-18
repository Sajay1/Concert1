var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const Concert =require('../models/ConcertModel')
const bcrypt = require('bcrypt');
const { validationResult, check } = require('express-validator');



// GET - Render login page
router.get('/', (req, res) => {
  res.render('login', { message: null, errors: [] });
});

// GET - Render signup page
router.get('/signup', (req, res) => {
  res.render('signup', { message: null, errors: [] });
});

// POST - Handle signup
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
      return res.render('signup', { message: null, errors: errors.array() });
    }

    // Check if passwords match
    if (Password !== ConfirmPassword) {
      return res.render('signup', {
        message: 'Password and Confirm Password do not match',
        errors: [],
      });
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ Email });
      if (existingUser) {
        return res.render('signup', {
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
      res.redirect("/userlogin")
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);

// GET - Render login page
router.get('/userlogin', (req, res) => {
  res.render('login', { errors: [] });
});

// POST - Handle login
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
      return res.render('login', { errors: errors.array() });
    }

    const { Email, Password } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ Email: Email });
      if (!user) {
        return res.render('login', {
          message: 'Incorrect Email Address.',
          errors: [],
        });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(Password, user.Password);

      if (!isPasswordValid) {
        return res.render('login', { message: 'Incorrect password.', errors: [] });
      }

        if (user.Role === 'User') {
          Concert.find().then(data => {
            req.session.userId = user._id;
            res.render('./userconcert',{data:data,message:'User does not exist',error:[]})    
          }).catch(error => {
        
            console.error(error);
            
          });
        } else {
          res.render('./concert/create',{message:'User does not exist',error:null});
        }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);

// GET - Logout


router.get('/concert', async (req, res) => {

  const user=req.session.id;

  // Check if the user is logged in
  if (!req.session.userId) {
    return res.redirect('/userlogin');
  }

  try {
    const concerts = await Concert.find(); // Fetch all concerts
    res.render('./userconcert',{ data: concerts, error: [] }); // Render EJS with concerts data
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/logout' ,(req,res)=>{
  req.session.destroy((err) =>{
    if (err){
      console.log(err);
      res.send('Error')
    }else{
      res.redirect('/userlogin')
    }
  });
  });


module.exports = router;