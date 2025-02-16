const mongoose = require('mongoose');

const PaidBySchema = new mongoose.Schema(
  {
    transaction_id: { type: String, required: true, unique: true },
    tutor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tutor',
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    time_ranges: [
      {
        start_time: {
          type: Date,
          required: true,
          default: () => {
            const firstDay = new Date();
            firstDay.setDate(1);
            firstDay.setHours(0, 0, 0, 0);
            return firstDay;
          },
        },
        end_time: {
          type: Date,
          required: true,
          default: () => {
            const endDay = new Date();
            endDay.setDate(20);
            endDay.setHours(23, 59, 59, 999);
            return endDay;
          },
        },
      },
    ],
    due_date: {
      type: Date,
      required: true,
      default: () => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaidBy', PaidBySchema);
