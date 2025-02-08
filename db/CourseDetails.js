const mongoose = require('mongoose');

const CourseDetailsSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillDevelopmentCourses',
  },
  comments: [
    {
      message: {
        type: String,
        required: true, // Ensure comments have a message
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      userName: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  reviews: [
    // Changed to an array to allow multiple reviews
    {
      message: {
        type: String,
        required: true, // Fixed spelling mistake
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      userName: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      rating: {
        type: Number,
        required: true,
        min: 1, // Enforcing rating limits (optional)
        max: 5,
      },
    },
  ],
});

module.exports = mongoose.model('CourseDetails', CourseDetailsSchema);
