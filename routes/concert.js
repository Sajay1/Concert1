<<<<<<< HEAD
var express = require('express');
var router = express.Router();
const Concert = require('../models/ConcertModel');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


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




router.get('/concert_create',(req,res)=>{
  res.render('./concert/create', {error: null})
});

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
        res.render('./concert/create', { error: validationError.errors});
    } else {
        concert.save().then(() => {
                res.redirect('/concert_retrieve');
            }).catch((error) => {
                console.error(error);
                
            });
   }
})


router.get('/concert_retrieve',(req, res) => {

    Concert.find().then(data => {
      res.render('./concert/retrieve',{data:data});
  
    }).catch(error => {
      
      console.error(error);
      
    });
  
  });


   router.get('/concert_update/:id',(req , res) =>{
      const concertId = req.params.id;
     Concert.findById(concertId).then(concert =>{
          res.render('./concert/update',{concert:concert,error: null
  })
      }).catch(error => {
          console.error(error);
        });
  })
  
  router.post('/concert_update/:id',upload.single('image'),(req, res) => {
      const concertId = req.params.id;
      const { ConcertName, Date, Venue, TicketPrice, AvailableTickets } = req.body;
      const image= req.file?req.file.filename:null;
          console.log(image);
      const concert = new Concert({ 
          ConcertName, 
          Date, 
          Venue, 
          TicketPrice,
          AvailableTickets ,
          image
          });
        

      const validationError = concert.validateSync();
      if (validationError) {
          // If there are validation errors, re-render the form with error messages
      res.render('./concert/update', {concert:concert, error: validationError.errors});
  
  
      } else {
      Concert.findByIdAndUpdate(
          concertId,
          { ConcertName, Date, Venue, TicketPrice, AvailableTickets ,image}
        )
          .then(() => {
            res.redirect('/concert_retrieve'); // Redirect to the concert list after updating
          })
          .catch(error => {
            console.error(error);
          });
      }
  })



  router.get('/concert_delete/:id',(req , res) =>{
      const concertId = req.params.id;
     Concert.findById(concertId).then(concert =>{
          res.render('./concert/delete',{concert:concert})
      }).catch(error => {
          console.error(error);
        });
  })
  
  router.post('/concert_delete/:id',(req, res) =>{
      const concertId = req.params.id;
      Concert.findByIdAndDelete(concertId)
          .then(() => {
            res.redirect('/concert_retrieve'); // Redirect to the concert list after deleting
          })
          .catch(error => {
            console.error(error);
          });
  })


=======
var express = require('express');
var router = express.Router();
const Concert = require('../models/ConcertModel');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


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




router.get('/concert_create',(req,res)=>{
  res.render('./concert/create', {error: null})
});

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
        res.render('./concert/create', { error: validationError.errors});
    } else {
        concert.save().then(() => {
                res.redirect('/concert_retrieve');
            }).catch((error) => {
                console.error(error);
                
            });
   }
})


router.get('/concert_retrieve',(req, res) => {

    Concert.find().then(data => {
      res.render('./concert/retrieve',{data:data});
  
    }).catch(error => {
      
      console.error(error);
      
    });
  
  });


   router.get('/concert_update/:id',(req , res) =>{
      const concertId = req.params.id;
     Concert.findById(concertId).then(concert =>{
          res.render('./concert/update',{concert:concert,error: null
  })
      }).catch(error => {
          console.error(error);
        });
  })
  
  router.post('/concert_update/:id',upload.single('image'),(req, res) => {
      const concertId = req.params.id;
      const { ConcertName, Date, Venue, TicketPrice, AvailableTickets } = req.body;
      const image= req.file?req.file.filename:null;
          console.log(image);
      const concert = new Concert({ 
          ConcertName, 
          Date, 
          Venue, 
          TicketPrice,
          AvailableTickets ,
          image
          });
        

      const validationError = concert.validateSync();
      if (validationError) {
          // If there are validation errors, re-render the form with error messages
      res.render('./concert/update', {concert:concert, error: validationError.errors});
  
  
      } else {
      Concert.findByIdAndUpdate(
          concertId,
          { ConcertName, Date, Venue, TicketPrice, AvailableTickets ,image}
        )
          .then(() => {
            res.redirect('/concert_retrieve'); // Redirect to the concert list after updating
          })
          .catch(error => {
            console.error(error);
          });
      }
  })



  router.get('/concert_delete/:id',(req , res) =>{
      const concertId = req.params.id;
     Concert.findById(concertId).then(concert =>{
          res.render('./concert/delete',{concert:concert})
      }).catch(error => {
          console.error(error);
        });
  })
  
  router.post('/concert_delete/:id',(req, res) =>{
      const concertId = req.params.id;
      Concert.findByIdAndDelete(concertId)
          .then(() => {
            res.redirect('/concert_retrieve'); // Redirect to the concert list after deleting
          })
          .catch(error => {
            console.error(error);
          });
  })


>>>>>>> d148a6cbb52ceadea0bd3e901cc07344e61d13c4
module.exports = router;