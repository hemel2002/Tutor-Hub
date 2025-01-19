require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const MongooseConnection = require('../db/MongooseConnection');
const SkillDevelopmentCourse = require('../db/SkillDevelopmentCourses');
const CourseMaterial = require('../db/CourseMaterial');
const CourseDetail = require('../db/CourseDetails');
const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'course_images',
    format: async () => 'png', // supports promises as well
    public_id: () => uuidv4(),
  },
});

const storage2 = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType = 'auto'; // Default to auto-detect based on file content

    // Check file type and set resource type accordingly
    if (file.mimetype.startsWith('video')) {
      resourceType = 'video';
    } else if (file.mimetype.startsWith('image')) {
      resourceType = 'image';
    }

    return {
      folder: 'course_materials',
      resource_type: resourceType,
      allowed_formats: [
        'jpeg',
        'jpg',
        'png',
        'pdf',
        'doc',
        'docx',
        'ppt',
        'pptx',
        'mp4',
        'mkv',
        'avi',
        'mov',
        'flv',
        'wmv',
        'webm',
      ],
    };
  },
});

const upload = multer({ storage: storage });
const upload2 = multer({ storage: storage2 });

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
router.get('/course', async (req, res) => {
  try {
    await MongooseConnection();
    const courses = await SkillDevelopmentCourse.find();
    console.log(courses);
    console.log(req.session.UserId);
    res.render('admin/newCourses', { courses });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    mongoose.connection.close();
  }
});

router.post('/course', upload.single('courseImage'), async (req, res) => {
  const { courseName, courseDescription, courseDuration, courseFee } = req.body;
  const courseImage = req.file.path.replace(
    '/upload/',
    '/upload/w_700,h_700,c_scale/'
  );

  console.log(courseImage);
  console.log(req.body);
  try {
    await MongooseConnection();
    const course = new SkillDevelopmentCourse({
      courseName,
      courseDescription,
      courseDuration,
      courseFee,
      courseImage,
    });
    await course.save();
    res.redirect('/admin/course');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/detailsCourse/:id', async (req, res) => {
  try {
    await MongooseConnection();
    const course = await SkillDevelopmentCourse.find({ _id: req.params.id });

    console.log('course for details', course);
    const courseDetails = await CourseDetail.find({ courseId: req.params.id });
    const courseMaterial = await CourseMaterial.find({
      courseId: req.params.id,
    });
    console.log('1234', courseDetails);
    res.render('admin/detailsCourses', {
      courseId: req.params.id,
      courseDetails,
      courseMaterial,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/:CourseId/comments', async (req, res) => {
  const { message } = req.body;
  const courseId = req.params.CourseId;
  const userId = req.session.UserId;
  const findUser = await User.find({ 'user id': userId });
  console.log(findUser);
  console.log(req.body, req.params, userId);
});
router.post(
  '/:courseId/uploadvideo',
  upload2.single('videoFile'),
  async (req, res) => {
    const { videoTitle, contentType } = req.body;
    const courseId = req.params.courseId;
    const contentUrl = req.file.path;
    console.log(req.body, req.params, req.file);
    try {
      await MongooseConnection();
      const Material = new CourseMaterial({
        courseId,
        title: videoTitle,
        contentType,
        contentUrl,
      });
      await Material.save();
      res.redirect('/admin/detailsCourse/' + courseId);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);
module.exports = router;
