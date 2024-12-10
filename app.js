const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
// const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const app = express();
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
// mongoose.connect('mongodb://localhost:27017/ecommerce', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// }).then(() => {
//     console.log('Database Connected');
// }).catch((err) => {
//     console.log('Database Connection Failed');
// });
//////////////////////////Mongoose Connection//////////////////////////
app.get('/', (req, res) => {
  res.render('index');
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
