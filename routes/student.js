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
  res.render('student/Dashboard');
});
router.get('/SearchTutor', (req, res) => {
  res.render('student/searchTutor');
});
router.get('/rating&commnet', (req, res) => {
  res.render('student/RatingAndCommentPage');
});
module.exports = router;
