const mongoose = require('mongoose');

const CourseMaterialSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillDevelopmentCourses',
    required: true, // Ensure a course is always linked
  },
  courseAsset: [
    {
      title: { type: String, required: true },
      contentType: {
        type: String,
        enum: ['video', 'pdf', 'link'],
        required: true,
      },
      contentUrl: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('CourseMaterial', CourseMaterialSchema);
