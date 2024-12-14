require('dotenv').config();

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const CreateNewUser = require('./db/userModel');
const session = require('express-session');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const mongoose = require('mongoose');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { Cloudinary } = require('cloudinary');
const MongooseConnection = require('./db/MongooseConnection');
const app = express();
///connect .env file

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public', 'html'));

app.set('view engine', 'ejs');

//////////////////////////Mongoose Connection//////////////////////////

const PORT = process.env.PORT;

/////////////////////home///////////////////
app.get('/', (req, res) => {
  res.render('signin');
});
/////////////////////signup////////////////////////

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { first_name, last_name, email, password, account_type } = req.body;
  try {
    // Ensure the mongoose connection is established
    await MongooseConnection();

    // Fetch the last user to determine the next user ID
    const lastUser = await CreateNewUser.findOne()
      .sort({ 'user id': -1 })
      .limit(1);

    let nextUser = 1;
    if (lastUser) {
      const userId = lastUser['user id'];
      nextUser = parseInt(userId.replace(/[^\d]/g, '')) + 1; // Extract digits and increment
    }

    const user_id = `U${nextUser}`;
    console.log(user_id);

    // Create the new user
    await CreateNewUser.create({
      'user id': user_id,
      'first name': first_name,
      'last name': last_name,
      email: email,
      password: password,
      'account type': account_type,
    });

    res.redirect('/signin');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  } finally {
    mongoose.connection.close();
  }
});

/////////////////////signin////////////////////////

app.get('/signin', (req, res) => {
  res.render('signin');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
});
