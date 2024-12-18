const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

const MongooseConnection = async () => {
  await mongoose
    .connect(mongoURI)
    .then(() => {
      console.log('Database Connected');
    })
    .catch((err) => {
      console.log('Database Connection Failed', err);
    });
};
module.exports = MongooseConnection;

module.exports = MongooseConnection;
