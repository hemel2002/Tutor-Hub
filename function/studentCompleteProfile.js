const mongoose = require('mongoose');
const StudentSchema = require('../db/StudentSchema');
const MongooseConnection = require('../db/MongooseConnection');

const completeProfile = async (req, res, next) => {
  try {
    const userId = req.session.UserId;
    console.log(userId);
    await MongooseConnection();
    const user = await StudentSchema.findOne({ userId: userId });
    console.log(user);

    if (user.location !== 'Location' && user.class !== 'Class') {
      next();
    } else {
      return res.redirect('http://localhost:3000/student/completeProfile');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = completeProfile;
