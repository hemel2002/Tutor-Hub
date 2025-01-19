const mongoose = require('mongoose');
const CourseMaterialSchema = {
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillDevelopmentCourses',
  },
  title: { type: String, required: true },
  contentType: { type: String, enum: ['video', 'pdf', 'link'], required: true },
  contentUrl: { type: String, required: true }, // Link to the material
  uploadedAt: { type: Date, default: Date.now },
};
module.exports = mongoose.model('CourseMaterial', CourseMaterialSchema);
