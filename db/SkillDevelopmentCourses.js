const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: [true, 'Course Name is required'] },
    courseDescription: {
      type: String,
      required: [true, 'Course Description is required'],
    },
    courseDuration: {
      type: String,
      required: [true, 'Course Duration is required'],
    },
    courseFee: { type: Number, required: [true, 'Course Fee is required'] },
    courseImage: { type: String, default: 'https://res.cloudinary.com/da7hq' },
  },
  { timestamps: true }
);

// Use singular name for consistency
module.exports = mongoose.model('SkillDevelopmentCourse', CourseSchema);
