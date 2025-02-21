const mongoose = require('mongoose');
const TeachesSchema = new mongoose.Schema({
  tutorEmail: {
    type:String,
    ref: 'Tutor',
    required: true,
  },
  studentEmail: {
    type:String,
    required: true,
  },
 
  class: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending',
  },
  request:{
    type: String,
    required: true,
    enum: ['Accepted', 'Rejected', 'Pending'],
    default: 'Pending',
  },
 WeeklySchedule: [
    {
      day: {
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      startTime: { type: String },
      endTime: { type: String },
    },
  ],
});

module.exports = mongoose.model('Teaches', TeachesSchema);
