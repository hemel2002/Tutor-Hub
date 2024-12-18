require('dotenv').config();

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
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
const CreateNewUser = require('./db/userModel');
const hashPass = require('./function/hashing');
const app = express();
const OpenAI = require('openai');
const axios = require('axios');

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
app.set('views', path.join(__dirname, 'public', 'ejs'));

app.set('view engine', 'ejs');
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//////////////////////////Mongoose Connection//////////////////////////

const PORT = process.env.PORT;

/////////////////////sign in///////////////////
// Ensure you have this dependency installedconst axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://famous-quotes4.p.rapidapi.com/random',
  params: {
    category: 'education',
    count: '1',
  },
  headers: {
    'x-rapidapi-key': process.env.RAPID_API_KEY,
    'x-rapidapi-host': 'famous-quotes4.p.rapidapi.com',
  },
};

app.get('/signin', async (req, res) => {
  try {
    const response = await axios.request(options);
    console.log(response.data[0]);
    res.render('home/signin', { quotes: response.data[0] });
  } catch (error) {
    console.error(error);
  }
});

app.post('/signin', async (req, res) => {
  const { email } = req.body;

  try {
    await MongooseConnection();
    const user = await CreateNewUser.findOne({ email: email });
    if (user) {
      req.flash('success', `Welcome, ${user['full name']}.`);
      res.redirect(`/validuser?email=${email}`);
    } else {
      req.flash('error', 'user not found, please sign up');
      res.redirect('/signin');
    }
  } catch (error) {
    req.flash('error', 'Internal server error');
    res.redirect('/signin');
  } finally {
    mongoose.connection.close();
  }

  console.log(req.body);
});
/////////valid user signin/////////////
app.get('/validuser', async (req, res) => {
  const email = req.query.email;
  try {
    await MongooseConnection();

    const user = await CreateNewUser.findOne({ email: email });
    res.render('home/SignUpAfterValidation', {
      fullname: user['full name'],
      pic: user['profile picture'],
      email: user.email,
    });
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
});
app.post('/validuser', async (req, res) => {
  const { email, password } = req.body;

  try {
    await MongooseConnection();
    const user = await CreateNewUser.findOne({ email: email });
    const validUser = await bcrypt.compare(password, user.password);

    if (validUser) {
      req.flash('success', 'Successfully signed in');
      res.redirect('/dashboard');
    } else {
      req.flash('error', 'Invalid email or password');
      res.redirect('/signin');
    }
  } catch (error) {
    req.flash('error', 'Internal server error');
    res.redirect('/signin');
  } finally {
    mongoose.connection.close();
  }
});

/////////////////////signup////////////////////////

app.get('/signup', (req, res) => {
  // MongooseConnection();
  // await CreateNewUser.collection.drop();

  res.render('home/signup');
});

app.post('/signup', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    account_type,
    confirmPassword,
  } = req.body;
  console.log(req.body);
  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match');
    res.redirect('/signup');
    return;
  }
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

    const user_id = `U000000${nextUser}`;
    const hashPasswoord = await hashPass(password);

    // Create the new user
    const newUser = new CreateNewUser({
      'user id': user_id,
      'first name': first_name,
      'last name': last_name,
      email: email,
      password: hashPasswoord,
      'account type': account_type,
      _id: new mongoose.Types.ObjectId(),
    });
    await newUser.save();
    req.flash('success', 'User created successfully');

    return res.redirect('/signin');
  } catch (error) {
    console.log(error);
    req.flash('error', error.message);
    res.redirect('/signup');
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
  console.log(`http://localhost:${PORT}/signin`);
});
