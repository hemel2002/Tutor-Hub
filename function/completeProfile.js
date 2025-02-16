const mongoose = require('mongoose');
const teacherSchema = require('../db/teacherSchema');
const MongooseConnection = require('../db/MongooseConnection');

const completeProfile = async (req, res, next) => {
  try {
    const userId = req.session.UserId;
    console.log(userId);
    await MongooseConnection();
    const user = await teacherSchema.findOne({ userId: userId });
    console.log(user);

    if (
      user &&
      user.location &&
      user.location.length > 0 &&
      user.instituteName &&
      user.instituteName.length > 0 &&
      user.preferableSubjects &&
      user.preferableSubjects.length > 0
    ) {
      next();
    } else {
      return res.redirect('http://localhost:3000/teacher/completeProfile');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = completeProfile;
