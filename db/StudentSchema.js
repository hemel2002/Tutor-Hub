const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  class: { type: String, required: true ,
    default: 'Class'
  },
  location: { type: String, required: true,
    default: 'Location'
  },
  

  email: { type: String, required: true, unique: true },
  profilePicture: {
    type: String,
    default:
      'https://res.cloudinary.com/da7hqzvvf/image/upload/v1724531262/profile_pic/ib0f9aexeto7vw9c3rqf.webp',
  },
  enrolledCourses: [
    {
      courseId: { type: String, required: true },
      enrolledAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Student', StudentSchema);
