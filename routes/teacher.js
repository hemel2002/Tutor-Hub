const path = require('path');
const methodOverride = require('method-override');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const mongoose = require('mongoose');
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage });
const MongooseConnection = require('../db/MongooseConnection');
const PaymentsMadebyStudentsSchema = require('../db/PaymentsMadebyStudentsSchema');
const TeachesSchema = require('../db/TeachesSchema');
const Teacher = require('../db/teacherSchema');
const requireLogin = require('../routes/RequireLoginMiddleware.js');
const completeProfile = require('../function/completeProfile.js');
const User = require('../db/userModel.js');

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/dashboard', requireLogin, completeProfile, (req, res) => {
  res.render('teacher/Dashboard');
});

router.get('/Profile', requireLogin, completeProfile, (req, res) => {
  res.render('teacher/Profile');
});

router.get('/Payment', requireLogin, completeProfile, (req, res) => {
  res.render('teacher/Payment');
});

router.get('/GetVerified', completeProfile, async (req, res) => {
  try {
    await MongooseConnection();
    const teacher = await Teacher.findOne({ userId: req.session.UserId });
    let message = 'Please submit your documents';
    if (teacher.idCardUrl) {
      message = 'Your documents are already  Submitted';
    }
    console.log(teacher);
    console.log(message);
    return res.render('teacher/teacherVerification', { message });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.disconnect();
  }
});

// router.post(
//   '/GetVerified',
//   upload.fields([
//     { name: 'idCard', maxCount: 1 },
//     { name: 'additionalDoc', maxCount: 1 },
//   ]),
//   async (req, res) => {
//     console.log(req.files);
//     const { idCard, additionalDoc } = req.files;
//     const idCardPath = idCard ? idCard[0].path : null;
//     const additionalDocPath = additionalDoc ? additionalDoc[0].path : null;
//     const userId = req.session.UserId;

// );

router.get('/viewprofile', requireLogin, (req, res) => {
  res.render('teacher/viewprofile');
});

router.get('/editprofile', requireLogin, (req, res) => {
  res.render('teacher/editprofile');
});

////////////////////////// Payment History //////////////////////////
router.get(
  '/PaymentHistory',
  requireLogin,

  async (req, res) => {
    const userId = req.session.userId;

    try {
      await MongooseConnection();

      const payments = await TeachesSchema.find({ tutor_id: userId });

      console.log(payments);

      res.render('teacher/PaymentHistory', { payments });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } finally {
      await mongoose.disconnect(); // Properly close the connection
    }
  }
);

///////////////// Change Password ////////////////////////
router.get('/ChangePassword', requireLogin, (req, res) => {
  res.render('teacher/ChangePassword');
});
router.post('/ChangePassword', requireLogin, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.session.UserId;
  try {
    await MongooseConnection();
    const teacher = await User.findOne({ userId });
    if (!teacher) {
      return res.status(404).send('Teacher not found');
    }
    const isMatch = await bcrypt.compare(oldPassword, teacher.password);
    if (!isMatch) {
      return res.status(400).send('Invalid password');
    }
    teacher.password = bcrypt.hashSync(newPassword, 14);
    await teacher.save();
    req.flash('success', 'Password changed successfully');
    res.redirect('/teacher/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong, please try again');
    return res.redirect('/teacher/ChangePassword');
  } finally {
    await mongoose.disconnect();
  }
});
////////// Calendar ////////////////////////
router.get('/changecalender', requireLogin, (req, res) => {
  res.render('teacher/changecalender');
});
router.get('/completeProfile', requireLogin, async (req, res) => {
  const userId = req.session.UserId;
  try {
    await MongooseConnection();
    const teacher = await Teacher.findOne({ userId: userId });
    console.log(teacher);
    res.render('teacher/CompleteProfile.ejs', { teacher });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.disconnect();
  }
});
router.post(
  '/completeProfile',
  upload.single('ID_CARD_IMAGE'),
  async (req, res) => {
    console.log(req.body); // Other form fields
    console.log(req.file.path); // ID card file details
    const {
      FIRST_NAME,
      LAST_NAME,
      PHONE,
      PREFERRED_SUBJECT,
      INSTITUTE_NAME,
      EXPERIENCE,
      AREA,
    } = req.body;
    try {
      await MongooseConnection();
      const teacher = await Teacher.findOne({ userId: req.session.UserId });
      teacher.firstName = FIRST_NAME;
      teacher.lastName = LAST_NAME;
      teacher.phone = PHONE;
      teacher.preferableSubjects = PREFERRED_SUBJECT;
      teacher.instituteName = INSTITUTE_NAME;
      teacher.experience = EXPERIENCE;
      teacher.location = AREA;
      teacher.idCardUrl = req.file.path;
      await teacher.save();
      return res.redirect('/teacher/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } finally {
      await mongoose.disconnect();
    }
  }
);
router.post('/profilePic', upload.single('PROFILE_IMAGE'), async (req, res) => {
  console.log(req.file);
  // Uploaded file details
  const userId = req.session.UserId;
  try {
    await MongooseConnection();
    const teacher = await Teacher.findOne({ userId: userId });
    teacher.profilePicture = req.file.path;
    await teacher.save();

    res.json({
      message: 'Profile picture uploaded successfully!',
      file: req.file,
      path: req.file.path,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.disconnect();
  }
});

module.exports = router;
