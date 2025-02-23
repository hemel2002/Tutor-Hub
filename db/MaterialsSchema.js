const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema(
  {
    studentEmail: { type: String, required: true },
    teacherEmail: { type: String, required: true },
    assets: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true }, // Assuming you want to store a URL for the asset
        description: { type: String, required: true }, // Added description inside the assets array
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', MaterialSchema);
