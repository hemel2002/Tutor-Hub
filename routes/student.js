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

const express = require('express');
const router = express.Router();
router.get('/dashboard', (req, res) => {
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
