const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

const MongooseConnection = () => {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log('Database Connected');
    })
    .catch((err) => {
      console.log('Database Connection Failed', err);
    });
};
module.exports = MongooseConnection;
