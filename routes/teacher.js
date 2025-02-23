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
const Schedule = require('../db/scheduleSchema.js');
const Material = require('../db/MaterialsSchema.js');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const cloudinary = require('cloudinary').v2; // Add this line

// ...existing code...

router.get('/dashboard', requireLogin, completeProfile, (req, res) => {
  res.render('teacher/teacher');
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
    const teacher = await Teacher.findOne({ email: req.session.email });
    let message = 'Please submit your documents';
    if (teacher.idCardUrl) {
      message = 'Your documents are already  Submitted';
    }
    console.log('Teacher:', teacher.accoutStatus);
    return res.render('teacher/teacherVerification', {
      message,
      teacher,
      accountStatus: teacher.accoutStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.disconnect();
  }
});

router.post('/GetVerified', upload.single('idCard'), async (req, res) => {
  try {
    // Check if file was uploaded
    await MongooseConnection();
    if (!req.file) {
      req.flash('error', 'No file uploaded');
      return res.redirect('/teacher/GetVerified');
    }

    // Check if session email exists
    const teacherEmail = req.session.email;
    if (!teacherEmail) {
      return res.status(401).send('Unauthorized: No session email found');
    }

    // Find teacher and update their record
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      req.flash('error', 'Teacher not found');
      return res.redirect('/teacher/GetVerified');
    }

    teacher.idCardUrl = req.file.path;
    teacher.accoutStatus = 'Pending';
    await teacher.save();

    req.flash('success', 'Documents submitted successfully');
    return res.redirect('/teacher/GetVerified');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

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
  res.render('teacher/schedule');
});
router.post('/changecalender', async (req, res) => {
  const { weekdays } = req.body;

  const userId = req.session.UserId;
  try {
    await MongooseConnection();
    const teacher = await Teacher.findOne({ userId });
    teacher.busySchedule = weekdays;
    await teacher.save();
    req.flash('success', 'Availability updated successfully');
    res.redirect('/teacher/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong, please try again');
    return res.redirect('/teacher/changecalender');
  } finally {
    await mongoose.disconnect();
  }
  console.log(req.body);
});
////////////////////////// //// //////////////////////////

/////////need to fix this route///////////////////////////

////////////////need to fix this route///////////////////////////
router.post('/save-schedule', async (req, res) => {
  const { schedule } = req.body;
  const tutorId = req.session.UserId; // Expecting something like "T67b69d2e53ba0b544181b289"

  console.log('Request body:', req.body);
  console.log('Tutor ID from session:', tutorId);

  try {
    // Validate tutor ID format

    // Find teacher using tutorId as userId
    await MongooseConnection();
    const teacher = await Teacher.findOne({ userId: tutorId });
    console.log('Teacher:', teacher);

    if (!teacher) {
      console.log('Teacher not found');
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Validate schedule data
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ error: 'Schedule must be an array' });
    }

    // Add new schedule slots to the teacher's schedule
    teacher.schedule.push(...schedule);

    // Save the updated teacher document
    await teacher.save();

    console.log('Updated teacher schedule:', teacher.schedule);
    res.status(201).json(teacher.schedule);
  } catch (error) {
    console.error('Error saving schedule:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate schedule slot' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/get-schedule', async (req, res) => {
  const tutorId = req.session.UserId; // Assuming the tutor ID is stored in the session

  try {
    // Validate tutor ID format
    await MongooseConnection();
    // Find the teacher using the tutorId (userId)
    const teacher = await Teacher.findOne({ userId: tutorId });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Return the saved schedule
    res.status(200).json(teacher.schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/test', async (req, res) => {
  res.render('teacher/test');
});
////////////////////////// //// //////////////////////////
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
//////////////////////////uplaod materrial//////////////////////////
router.get('/uploadMaterial', requireLogin, async (req, res) => {
  const teacherId = req.session.email;
  console.log('Teacher ID:', teacherId);
  try {
    await MongooseConnection();
    const Student = await TeachesSchema.find({ tutorEmail: teacherId });
    const materials = await Material.find({ teacherEmail: teacherId });
    console.log('Student:', Student);
    return res.render('teacher/uploadMaterial', { Student, materials });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Internal Server Error');
    return res.redirect('/teacher/dashboard');
  } finally {
    await mongoose.disconnect();
  }
});
router.post('/uploadMaterial', upload.single('file'), async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    if (!req.file) {
      throw new Error('File upload failed. Please select a valid file.');
    }

    const { title, description, studentEmail } = req.body;

    const teacherEmail = req.session.email;

    if (!teacherEmail) {
      req.flash('error', 'Unauthorized! Please log in.');
      return res.redirect('/signin');
    }

    let assets;

    if (req.file.buffer) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'materials',
            public_id: path.parse(req.file.originalname).name,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file.buffer);
      });

      assets = uploadResult.secure_url;
    } else {
      assets = req.file.path; // Fallback if Multer storage works correctly
    }
    await MongooseConnection();
    const ExistMaterial = await Material.findOne({
      studentEmail,
      teacherEmail,
    });
    if (ExistMaterial) {
      ExistMaterial.assets.push({
        title,
        url: assets,
        description,
      });
      await ExistMaterial.save();
      req.flash('success', 'Material updated successfully');
    } else {
      const material = new Material({
        studentEmail,
        teacherEmail,
        assets: [
          {
            title,
            url: assets,
            description,
          },
        ],
      });
      await material.save();
      req.flash('success', 'Material uploaded successfully');
    }
    return res.redirect('/teacher/uploadMaterial');

    // Save to database
    // const material = new Material({ teacher_id: userId, student_id: studentID, title, description, assets });
    // await material.save();
  } catch (error) {
    console.error('Upload Error:', error);
    req.flash('error', error.message);
    return res.redirect('/teacher/uploadMaterial');
  }
});
///////////////////////////////delete material//////////////////////////
router.get('/deleteMaterial/:id', async (req, res) => {
  const materialId = req.params.id;
  try {
    await MongooseConnection();
    const material = await Material.findByIdAndDelete(materialId);
    if (!material) {
      req.flash('error', 'Material not found');
      return res.status(404).redirect('/teacher/dashboard');
    }
    req.flash('success', 'Material deleted successfully');
    res.redirect('/teacher/dashboard');
  } catch (error) {
    console.error('Error deleting material:', error);
    req.flash('error', 'Internal Server Error');
    res.status(500).redirect('/teacher/dashboard');
  } finally {
    await mongoose.disconnect();
  }
});

////////////////////////// //// //////////////////////////
router.get('/studentRequests', requireLogin, async (req, res) => {
  const userEmail = req.session.email;
  console.log('email', userEmail);
  try {
    await MongooseConnection();

    const requests = await TeachesSchema.find({
      tutorEmail: userEmail,
      request: 'Pending',
    });
    console.log('requests', requests);
    res.render('teacher/studentRequest', { requests });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.disconnect();
  }
});
////////////////////////// complete Profile //////////////////////////
router.get('/completeProfile', requireLogin, async (req, res) => {
  const userId = req.session.UserId;
  try {
    await MongooseConnection();
    const teacher = await Teacher.findOne({ userId: userId });

    res.render('teacher/CompleteProfile.ejs', { teacher });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.connection.close();
  }
});
router.post(
  '/completeProfile',
  upload.single('ID_CARD_IMAGE'),
  async (req, res) => {
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
      await mongoose.connection.close();
    }
  }
);
/////////////////////////student schedule//////////////////////////
router.get('/studentSchedule', requireLogin, async (req, res) => {
  const userId = req.session.UserId;
  try {
    await MongooseConnection();
    const teacher = await Teacher.findOne({ userId });
    const schedule = teacher.busySchedule;
    res.render('teacher/studentSchedule', { schedule });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.disconnect();
  }
});
////////////////////////// //// //////////////////////////
// Adjust the path as necessary

router.post('/acceptRequest', async (req, res) => {
  const { schedule, studentEmail } = req.body; // Ensure tutorId is extracted from the request
  const tutorId = req.session.email; // Assuming the tutor ID is stored in the session
  console.log('Request body:', req.body);

  if (!schedule || !tutorId) {
    return res
      .status(400)
      .send('Request ID, schedule, and tutor ID are required');
  }

  try {
    // Ensure Mongoose is connected (you might want to do this once at app startup)
    await MongooseConnection();

    // Find the teacher
    const teacher = await Teacher.findOne({ email: tutorId });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Validate schedule data
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ error: 'Schedule must be an array' });
    }
    teacher.schedule.push(...schedule);
    await teacher.save();
    // Convert numeric day to string day and format schedule for teacher
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formattedSchedule = schedule.map((entry) => {
      const startTime = entry.time;
      const endTime = calculateEndTime(startTime, 1); // Calculate end time by adding 1 hour
      return {
        day: dayMap[entry.day],
        startTime,
        endTime,
      };
    });
    console.log('tutorId', tutorId);
    console.log('StudentEmail', studentEmail);
    // Update the request status and weekly schedule
    const request = await TeachesSchema.findOne({
      studentEmail: studentEmail,
      tutorEmail: tutorId,
    });
    if (!request) {
      console.log('Request not found');

      return res.status(404).send('Request not found');
    }

    request.request = 'Accepted';
    request.WeeklySchedule = formattedSchedule;
    await request.save();
    console.log('Request accepted:', request);

    res.status(200).send('Request accepted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Helper function to calculate end time
function calculateEndTime(startTime) {
  const [hour, minute] = startTime.split(':').map(Number);
  const endHour = hour + 1; // Always add 1 hour
  return `${endHour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}`;
}
/////////////////////////cancel request//////////////////////////
router.get('/cancelRequest', async (req, res) => {
  const { studentEmail } = req.query;
  const tutorEmail = req.session.email;
  try {
    await MongooseConnection();
    const request = await TeachesSchema.deleteOne({
      studentEmail,
      tutorEmail,
    });
    if (!request) {
      return res.status(404).send('Request not found');
    }

    req.flash('success', 'Request rejected successfully');
    return res.redirect('/teacher/studentRequests');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await mongoose.disconnect();
  }
});
module.exports = router;
