


const PaidForSchema = new mongoose.Schema({
  transaction_id: { type: String, required: true, unique: true },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillDevCourse',
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
});

module.exports = mongoose.model('PaidFor', PaidForSchema);
