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
router.get('/teacher', (req, res) => {
  res.render('admin/teacher');
});
router.get('/StudentManagement', (req, res) => {
  res.render('admin/StudentManagement');
});
router.get('/Complaints', (req, res) => {
  res.render('admin/Complaints_Dashboard');
});
router.get('/student', (req, res) => {
  res.render('admin/student');
});

module.exports = router;
