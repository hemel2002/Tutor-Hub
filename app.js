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
const TokenModel = require('./db/ForgetModel');
const sendOtpEmail = require('./routes/email');
const { PASSWORD_RESET_REQUEST_TEMPLATE } = require('./routes/EmailTemp');
const getWirelessIP = require('./routes/GetWirelessIp');
const admin = require('./routes/admin');
const teacher = require('./routes/teacher');
const student = require('./routes/student');
const courses = require('./routes/functiions');
const axios = require('axios');
const course = require('./routes/functiions');
const SkillDevelopmentCourses = require('./db/SkillDevelopmentCourses');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CourseMaterial = require('./db/CourseMaterial');
const requireLogin = require('./routes/RequireLoginMiddleware');

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
  res.locals.localhost = `http://${getWirelessIP()}:${PORT}`;
  res.locals.UserId = req.session.UserId;
  res.locals.accountType = req.session.accountType;
  next();
});
app.use('/admin', admin);
app.use('/teacher', teacher);
app.use('/student', student);

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
      req.flash('success', `Welcome, ${user.fullName}.`);
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
    console.log(user.fullName);

    res.render('home/SigninAfterValidation', {
      fullname: user.fullName,
      pic: user.profilePicture,
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
  console.log(req.body);
  console.log(email, password);

  try {
    await MongooseConnection();
    const user = await CreateNewUser.findOne({ email: email });
    const account_type = user.accountType;
    const validUser = await bcrypt.compare(password, user.password);

    if (validUser) {
      if (req.session.returnTo) {
        const redirect = req.session.returnTo;
        req.session.UserId = user.userId;
        delete req.session.returnTo;
        return res.redirect(redirect);
      }
      req.flash('success', 'Successfully signed in');
      req.session.UserId = user.userId;
      req.session.accountType = user.accountType;
      console.log(req.session.accountType);
      res.redirect(`${account_type}/dashboard`);
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

  // Check if passwords match
  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/signup');
  }

  try {
    // Ensure mongoose connection is established
    await MongooseConnection();
    const userExists = await CreateNewUser.findOne({
      email: email,
    });
    if (userExists) {
      req.flash('error', 'User already exists');
      return res.redirect('/signup');
    }
    // Fetch the last user to determine the next user ID

    let user_id;

    // Generate the user_id based on account type
    if (account_type === 'teacher') {
      user_id = `T${new mongoose.Types.ObjectId()}`;
    } else if (account_type === 'student') {
      user_id = `S${new mongoose.Types.ObjectId()}`;
    }

    // Ensure user_id is not null
    if (!user_id) {
      throw new Error('Failed to generate a unique user ID');
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);
    console.log(user_id);

    // Create the new user
    const newUser = new CreateNewUser({
      userId: user_id, // Updated field name
      firstName: first_name, // Updated field name
      lastName: last_name, // Updated field name
      email: email,
      password: hashPassword,
      accountType: account_type, // Updated field name
    });

    await newUser.save();
    req.flash('success', 'User created successfully');

    // Redirect to sign-in page
    return res.redirect('/signin');
  } catch (error) {
    console.error(error);
    req.flash('error', error.message);
    return res.redirect('/signup');
  }
});
/////////////////////Verify Valid Email////////////////////////
app.get('/emailVerification', (req, res) => {
  res.render('home/verifyEmail');
});
/////////////////////Forget password////////////////////////
app.get('/forgetpassword', (req, res) => {
  res.render('home/forget');
});
app.post('/forgetpassword', async (req, res) => {
  const { email } = req.body;

  const Token = uuidv4();
  const subject = 'Password Reset Request';
  const resetLink = `http://${getWirelessIP()}:${PORT}/resetpassword?token=${Token}&email=${email}`;
  console.log(resetLink);
  const message = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
    `{resetURL}`,
    resetLink
  );
  console.log(message);
  try {
    await MongooseConnection();
    const user = await CreateNewUser.findOne({ email: email });
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/forgetpassword');
    }
    const SetToken = new TokenModel({
      email: email,
      token: Token,
      expiryTime: Date.now() + 36000000,
    });

    await SetToken.save();
    await sendOtpEmail(email, subject, message);
    req.flash('success', 'Password reset link sent to your email');
    return res.redirect('/SuccessResetLink');
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
});
//////////////////////////Reset Password//////////////////////////
app.get('/resetpassword', async (req, res) => {
  const { token, email } = req.query;
  try {
    await MongooseConnection();
    const user = await TokenModel.findOne({ email: email, token: token });
    if (!user || user.expiryTime < Date.now()) {
      req.flash('error', 'Invalid token or token expired');
      return res.redirect('/forgetpassword');
    }
    return res.render('home/ResetPassword', { email: email });
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
});
app.post('/resetpassword', async (req, res) => {
  const { password, confirmpassword, email } = req.body;
  console.log(req.body);
  if (password !== confirmpassword) {
    req.flash('error', 'Passwords do not match');
    return res.redirect(`/resetpassword?email=${email}`);
  }
  try {
    await MongooseConnection();
    const user = await CreateNewUser.findOne({ email: email });
    const hashPassword = await hashPass(password);
    user.password = hashPassword;
    console.log(user);
    await user.save();
    req.flash('success', 'Password reset successfully');
    return res.redirect('/signin');
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
});
//////////////////////////Nearby Teachers//////////////////////////
app.get('/nearby', (req, res) => {
  res.render('home/NearByTeachers');
});
//////////////////////////seccess ResetLink//////////////////////////
app.get('/SuccessResetLink', (req, res) => {
  req.flash('success', 'Password reset link sent to your email');
  res.render('home/SuccessResetLink');
});
//////////////////////////LANDING/////////////////////////
app.get('/home', async (req, res) => {
  const courses = await course();
  console.log(courses);

  res.render('home/home', { courses });
});
///////////////////////testing////////////////////////
app.get('/testing', (req, res) => {
console.log(req.query);
res.send(`Alert ${req.query.name}`);
});

//////////////////////////contact/////////////////////////
app.get('/contact', (req, res) => {
  res.render('home/contact');
});
app.get('/NearbyTutor', (req, res) => {
  const teachers = [
    {
      name: 'Shahriar Hemal',
      area: 'Mirpur 12, Dhaka Metropolitan, Dhaka Division, Bangladesh',
      subject: 'Mathematics',
      rating: '4.8🌟',
      experience: '5 years',
      imageUrl: 'https://via.placeholder.com/150',
      T_ID: 1,
    },
    {
      name: 'Tutor Abcd',
      area: 'Mirpur-10, Begum Rokeya Sharani, Mirpur, Dhaka - 1216, Bangladesh',
      subject: 'Physics',
      rating: '4.6🌟',
      experience: '3 years',
      imageUrl: 'https://via.placeholder.com/150',
      T_ID: 2,
    },
    {
      name: 'Hemal',
      area: 'West End Street',
      subject: 'Chemistry',
      rating: '4.9🌟',
      experience: '7 years',
      imageUrl: 'ECB Chottor, ECB Chattar, Matikata, Dhaka - 1206, Bangladesh',
      T_ID: 3,
    },
    {
      name: 'Tutor 001',
      area: 'New Airport Road, Baunia, Dhaka - 1230, Bangladesh',
      subject: 'Biology',
      rating: '4.7🌟',
      experience: '6 years',
      imageUrl: 'https://via.placeholder.com/150',
      T_ID: 4,
    },
  ];

  return res.json(teachers);
});
//////////Enroll////////////////////////
app.get('/enrolled', (req, res) => {
  res.render('home/EnrollCourses');
});
//////////////////////////courses/////////////////////////
app.get('/courses', async (req, res) => {
  const courses = await course();
  console.log(courses);
  res.render('home/Courses', { courses });
});

//////////////course details////////////////////////
app.get('/courseDetails', async (req, res) => {
  const id = req.query.id;
  try {
    await MongooseConnection();
    const course = await SkillDevelopmentCourses.find({ _id: id });
    const courseMaterial = await CourseMaterial.find({ courseId: id });
    console.log(course);

    res.render('home/CourseDetails', { course, courseMaterial });
  } catch (error) {
    console.log(error);
  }
});
//////////////////////////enroll/////////////////////////
app.get('/enroll', requireLogin, async (req, res) => {
  try {
    const course = req.query.course;
    const courseId = req.query.id;
    const user = req.session.UserId;
    const amount = Number(req.query.amount);
    const image = req.query.image;

    console.log(courseId); // Debugging line

    if (!course || !user || !amount || isNaN(amount)) {
      return res.status(400).send('Invalid request parameters');
    }

    await MongooseConnection();

    const finduser = await CreateNewUser.findOne({ userId: user });

    if (!finduser) {
      return res.status(404).send('User not found');
    }

    console.log(finduser); // Debugging line

    // Properly check if the user is already enrolled
    if (finduser.enrolledCourses.some((c) => c.courseId === courseId)) {
      return res.redirect(
        `/successfullyEnrolled?id=${courseId}&userId=${req.session.UserId}`
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course,
              images: image ? [image] : [],
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/successfullyEnrolled?id=${courseId}&userId=${req.session.UserId}`,
      cancel_url: `http://localhost:3000/courseDetails`,
    });

    console.log(session); // Debugging line

    res.redirect(session.url);
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).send('Something went wrong');
  }
});
//////////////////////////course details/////////////////////////
app.get('/successfullyEnrolled', async (req, res) => {
  const userId = req.session.UserId; // Ensure UserId exists in session
  console.log('User ID:', userId);
  const courseId = req.query.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  // Ensure correct field name is used
  const updateResult = await CreateNewUser.updateOne(
    { userId: userId }, // Use exact field name from schema
    {
      $addToSet: {
        enrolledCourses: {
          courseId, // Ensure courseId is a string if schema expects a string
          enrolledAt: new Date(),
        },
      },
    }
  );

  console.log('Update Result:', updateResult);
  res.redirect(`CourseMaterials?id=${courseId}&userId=${req.session.UserId}`);
});
//////////////////////////course materials/////////////////////////

app.get('/CourseMaterials', async (req, res) => {
  console.log(req.query);

  try {
    await MongooseConnection();

    const courseId = req.query.id;
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Find course material
    const courseMaterial = await CourseMaterial.findOne({ courseId });

    console.log('Course Materials:', courseMaterial);

    res.render('home/CourseMaterials.ejs', {
      CourseMaterials: courseMaterial ? courseMaterial.courseAsset : [],
    });
  } catch (error) {
    console.error('Error fetching course materials:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
////////////////logout/////////////////////////
app.get('/logout', (req, res) => {
  req.session.destroy();

  return res.redirect('/signin');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/home`);
});
