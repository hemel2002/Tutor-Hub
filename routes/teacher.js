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

const express = require('express');
const router = express.Router();
router.get('/dashboard', (req, res) => {
  res.render('teacher/Dashboard');
});
router.get('/Profile', (req, res) => {
  res.render('teacher/Profile');
});
router.get('/Payment', (req, res) => {
  res.render('teacher/Payment');
});
router.get('/GetVerified', (req, res) => {
  res.render('teacher/CompleteProfile');
});
module.exports = router;
