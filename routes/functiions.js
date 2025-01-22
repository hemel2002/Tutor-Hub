const MongooseConnection = require('../db/MongooseConnection');
const SkillDevelopmentCourse = require('../db/SkillDevelopmentCourses');
const courseMaterial = require('../db/CourseMaterial');
const CourseDetail = require('../db/CourseDetails');
const User = require('../db/userModel');
const { default: mongoose } = require('mongoose');

const course = async () => {
  try {
    await MongooseConnection();
    const courses = await SkillDevelopmentCourse.find().sort({
      overAllRating: -1,
    });
    return courses; // Return the fetched courses
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
};
module.exports = course;
