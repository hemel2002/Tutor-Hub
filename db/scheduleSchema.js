const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Teacher',
    },
    day: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    time: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Ensures time is in HH:MM format
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add a compound unique index to prevent duplicate slots for the same teacher, day, and time
scheduleSchema.index({ teacherId: 1, day: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
