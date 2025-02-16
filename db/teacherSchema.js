const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'Something went wrong, please try again'],
      unique: true,
      ref: 'User', // Assuming a User model exists
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      minlength: [3, 'First name must be at least 3 characters'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      minlength: [3, 'Last name must be at least 3 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      lowercase: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default:
        'https://res.cloudinary.com/da7hqzvvf/image/upload/v1724531262/profile_pic/ib0f9aexeto7vw9c3rqf.webp',
    },
    instituteName: {
      type: String,
      trim: true,
      default: 'Independent Tutor',
    },
    preferableSubjects: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Course', // Assuming a Course model exists
        },
        enrolledAt: { type: Date, default: Date.now },
      },
    ],
    idCardUrl: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Teacher', teacherSchema);
