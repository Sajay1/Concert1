
var express = require('express');
var router = express.Router();


// Custom validation middleware for email
const validateEmail = (req, res, next) => {
    const Email = req.body.Email;
    const errors = [];
 
    if (!isValidEmail(Email)) {
      errors.push({ msg: 'Invalid email address' });
    }
 
    // Assign the errors to req.validationErrors
    req.validationErrors = req.validationErrors || [];
    req.validationErrors.push(...errors);
 
    next();
  };
 
  // Custom validation middleware for password
  const validatePassword = (req, res, next) => {
    const Password = req.body.Password;
    const errors = [];
 
    if (!isValidPassword(Password)) {
      errors.push({ msg: 'Password must meet certain criteria' });
    }
 
    // Assign the errors to req.validationErrors
    req.validationErrors = req.validationErrors || [];
    req.validationErrors.push(...errors);
 
    next();
  };
 


// Custom email validation logic
const isValidEmail = (Email) => {
  // Implement your custom email validation logic here
  // Example: Check if the email follows a specific format using regular expression
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(Email);
};


// Custom password validation logic
const isValidPassword = (Password) => {
  // Implement your custom password validation logic here
  // Example: Check if the password is at least 8 characters long
  return Password.length >= 8;
};




module.exports = { validateEmail, validatePassword };
module.exports = router;