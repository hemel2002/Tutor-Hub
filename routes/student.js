require('dotenv').config();

const path = require('path');
const methodOverride = require('method-override');

const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const mongoose = require('mongoose');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { Cloudinary } = require('cloudinary');
const MongooseConnection = require('../db/MongooseConnection');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Teaches=require('../db/TeachesSchema');
const completeProfile = require('../function/studentCompleteProfile');
const Student = require('../db/StudentSchema');
const Tutor = require('../db/teacherSchema'); 

const express = require('express');
const { resolveObjectURL } = require('buffer');
const router = express.Router();
const requireLogin = require('../routes/RequireLoginMiddleware');

router.post('/completeProfile', async (req, res) => {
  try {
    console.log('Received data:', req.body); // Log the request body
    await MongooseConnection(); // Ensure the connection is established

    const userId = req.session.UserId;
    const user = await Student.findOne({ userId: userId });
    console.log('User before update:', user); // Log the user before update

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update user fields
    user.firstName = req.body.FIRST_NAME;
    user.lastName = req.body.LAST_NAME;
    user.email = req.body.EMAIL;
    user.class = req.body.class;
    user.location = req.body.AREA;

    console.log('User after update (before save):', user); // Log the user after update

    // Save the user and handle potential errors
    await user.save().catch((error) => {
      if (error.code === 11000) {
        console.error('Duplicate key error:', error.message);
      } else {
        console.error('Validation Error:', error.message);
      }
      throw error; // Re-throw the error to be caught by the outer catch block
    });

    console.log('User after save:', user); // Log the user after save
    return res.redirect('/student/dashboard');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
  // finally {
  //   await mongoose.connection.close(); // Temporarily remove this for debugging
  // }
});
router.get('/dashboard',completeProfile ,(req, res) => {
  res.render('student/Dashboard');
});
router.get('/SearchTutor', (req, res) => {
  res.render('student/searchTutor');
});
router.get('/rating&commnet', (req, res) => {
  res.render('student/RatingAndCommentPage');
});
router.get('/profile', (req, res) => {
  res.render('student/profile');
});
router.get('/payment', (req, res) => {
  res.render('student/payment');
});
router.post('/cardPayment', async (req, res) => {
  console.log('card payment');
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tutor Fee',
            },
            unit_amount: 6000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/student/success',
      cancel_url: 'http://localhost:3000/student/cancel',
    });

    
    console.log(session);
    console.log(process.env.STRIPE_SECRET_KEY);

    res.redirect(session.url);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
///////////////////////////////hire tutor////////////////////////////////////////
router.get('/hireTutor',requireLogin,async (req, res) => {
  const tutorEmail = req.query.tutorEmail;
  const studentEmail = req.session.email;
  try {
    await MongooseConnection();
    const student = await Student.findOne({ email:studentEmail
      });

    const newTeaches = new Teaches({
      tutorEmail: tutorEmail,
      studentEmail:studentEmail,

    
      class: student.class,
      status: 'Pending',
      request: 'Pending',
   
    });
    await newTeaches.save();

    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
    
  }finally{
    res.redirect('/student/Dashboard');
    await mongoose.connection.close();

  }


});
///////////////////////////////hire tutor end////////////////////////////////////////
router.get('/completeProfile', async(req, res) => {
  try {
    await MongooseConnection();
    const userId = req.session.UserId;
    const user = await
    Student.findOne({ userId: userId });
 

  res.render('student/completeProfile', { user });
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.connection.close();
  }
});


router.get('/success', (req, res) => {
  res.render('student/PaymentSuccess');
});
router.get('/cancel', (req, res) => {
  res.render('student/cancel');
});
router.get('/QrPayment', (req, res) => {
  res.render('student/QrPayment');
});
router.get('/PaymentHistory', (req, res) => {
  res.render('student/PaymentHistory');
});
router.get('/ChangePassword', (req, res) => {
  res.render('student/ChangePassword');
});
router.get('/Dashboard', (req, res) => {
  res.render('student/Dashboard');
});
router.get('/booking', (req, res) => {
  res.render('student/booking');
});
module.exports = router;
