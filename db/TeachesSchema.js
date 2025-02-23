const mongoose = require('mongoose');
const TeachesSchema = new mongoose.Schema({
  tutorEmail: {
    type: String,
    ref: 'Tutor',
    required: true,
  },
  studentEmail: {
    type: String,
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
  request: {
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
  salary: {
    type: Number,
    required: true,
    default: 0,
  },
  message: {
    type: String,
    required: true,
    default: 'No message',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    required: true,
    default: 'Location',
  },
  subject: {
    type: String,
    required: true,
    default: 'Subject',
  },
});

module.exports = mongoose.model('Teaches', TeachesSchema);
