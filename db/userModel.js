const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userId: {
      // Updated field name
      type: String,
      required: [true, 'Something went wrong, please try again'],
      unique: true,
    },
    firstName: {
      // Updated field name
      type: String,
      required: [true, 'First name is required'],
      minlength: [3, 'First name must be at least 3 characters'],
    },
    lastName: {
      // Updated field name
      type: String,
      required: [true, 'Last name is required'],
      minlength: [3, 'Last name must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please fill a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      match: [
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ],
    },
    profilePicture: {
      // Updated field name
      type: String,
      default:
        'https://res.cloudinary.com/da7hqzvvf/image/upload/v1724531262/profile_pic/ib0f9aexeto7vw9c3rqf.webp',
    },
    accountType: {
      // Updated field name
      type: String,
      required: [true, 'Account Type is required'],
    },
    enrolledCourses: [
      {
        courseId: { type: String, required: true },
        enrolledAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
userSchema.index({ email: 1 }, { unique: true });
userSchema.virtual('fullName').get(function () {
  // Updated field name
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
