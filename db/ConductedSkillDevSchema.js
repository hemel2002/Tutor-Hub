

const ConductedBySchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillDevCourse',
    required: true,
  },
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
  },
});

module.exports = mongoose.model('ConductedBy', ConductedBySchema);
