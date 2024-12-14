const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    'user id': {
      type: String,
      required: [true, 'Somthing went wrong, please try again'],
      unique: true,
    },
    'first name': {
      type: String,
      required: [true, 'First name is required'],
      minlength: [3, 'First name must be at least 3 characters'],
    },
    'last name': {
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
    'profile picture': {
      type: String,
      default:
        'https://res.cloudinary.com/da7hqzvvf/image/upload/v1724531262/profile_pic/ib0f9aexeto7vw9c3rqf.webp',
    },
    'account type': {
      type: String,
      required: [true, 'Account Type is required'],
    },
  },

  {
    _id: false, // Disable the default _id field
  }
);
//   'phone number': {
//     type: Number,
//     required: [true, 'Phone number is required'],
//     match: [
//       /^880\d{10}$/,
//       'Please fill a valid phone number starting with 880',
//     ],
//   },
userSchema.virtual('full name').get(function () {
  return `${this['first name']} ${this['last name']}`;
});
const CreateNewUser = mongoose.model('Users', userSchema);

module.exports = CreateNewUser;
