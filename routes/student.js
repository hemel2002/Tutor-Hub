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
const Teaches = require('../db/TeachesSchema');
const completeProfile = require('../function/studentCompleteProfile');
const Student = require('../db/StudentSchema');
const Tutor = require('../db/teacherSchema');

const express = require('express');
const { resolveObjectURL } = require('buffer');
const router = express.Router();
const requireLogin = require('../routes/RequireLoginMiddleware');
const MaterialsSchema = require('../db/MaterialsSchema');

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
router.get('/dashboard', completeProfile, async (req, res) => {
  try {
    // Ensure MongoDB connection is established
    await MongooseConnection();

    // Get user email from session
    const userEmail = req.session.email;
    console.log('User email:', userEmail);

    // Find student data
    const student = await MaterialsSchema.findOne({ studentEmail: userEmail });
    console.log('Student:', student);

    // Get current day of the week
    const date = new Date();
    const weekName = date.toLocaleString('en-us', { weekday: 'short' });
    console.log('Today:', weekName);

    // Find today's sessions for the student
    let findTodaySession = await Teaches.find({
      studentEmail: userEmail,
      request: 'Accepted',
      'WeeklySchedule.day': weekName, // Use dot notation for nested fields
    });
    if (findTodaySession.length == 0) {
      req.flash('error', 'No session available for today');
      findTodaySession = 0;
    }
    console.log("Today's Sessions:", findTodaySession);

    // Render the dashboard with student data
    return res.render('student/Dashboard', {
      student,
      sessions: findTodaySession,
    });
  } catch (error) {
    console.error('Error in /dashboard route:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/SearchTutor', async (req, res) => {
  try {
    await MongooseConnection();
    const teacher = await Tutor.find();
    return res.render('student/SearchTutor', { teacher });
  } catch (error) {
    console.error('Error in /SearchTutor route:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.connection.close();
  }
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
router.get('/hireTutor', requireLogin, async (req, res) => {
  const studentEmail = req.session.email;
  let Class;
  let subject;
  let salary;
  let message;
  let tutorEmail;
  let location;

  if (req.body) {
    Class = req.body.class;
    subject = req.body.subject;
    salary = req.body.salary;
    message = req.body.message;
    tutorEmail = req.body.tutorEmail;
    location = req.body.location;
  }
  if (req.query) {
    Class = req.query.class;
    subject = req.query.subject;
    salary = req.query.salary;
    message = req.query.message;
    tutorEmail = req.query.tutorEmail;
    location = req.query.location;
  }

  try {
    await MongooseConnection();
    const alreadyHired = await Teaches.findOne({
      studentEmail: studentEmail,
      tutorEmail: tutorEmail,
    });
    if (alreadyHired) {
      if (alreadyHired.request === 'Accepted') {
        req.flash('error', 'You have already hired this tutor');
        return res.redirect('/student/Dashboard');
      } else if (alreadyHired.request === 'Pending') {
        req.flash('error', 'You have already sent request to this tutor');
        return res.redirect('/student/Dashboard');
      }
    } else {
      const student = await Student.findOne({ email: studentEmail });

      const newTeaches = new Teaches({
        tutorEmail: tutorEmail,
        studentEmail: studentEmail,
        class: Class,
        subject: subject,
        salary: salary,
        message: message,
        status: 'Pending',
        request: 'Pending',
        location: location,
      });
      await newTeaches.save();
    }
    res.redirect('/student/Dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.connection.close();
  }
});
///////////////////////////////hire tutor end////////////////////////////////////////
router.get('/completeProfile', async (req, res) => {
  try {
    await MongooseConnection();
    const userId = req.session.UserId;
    const user = await Student.findOne({ userId: userId });

    res.render('student/completeProfile', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.connection.close();
  }
});

//////////////////////////available tuttor////////////////////////////////////////

//////////////////////////available tuttor end////////////////////////////////////////

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
