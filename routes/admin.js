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
  res.render('admin/Admin_Dashboard');
});
router.get('/TeacherVerification', (req, res) => {
  res.render('admin/AccountVerification');
});
router.get('/PaymentMangement', (req, res) => {
  res.render('admin/PaymentMangement');
});
router.get('/TeacherManagement', (req, res) => {
  res.render('admin/TeacherManagement');
});
router.get('/StudentManagement', (req, res) => {
  res.render('admin/StudentManagement');
});
router.get('/Complaints', (req, res) => {
  res.render('admin/Complaints_Dashboard');
});
module.exports = router;
