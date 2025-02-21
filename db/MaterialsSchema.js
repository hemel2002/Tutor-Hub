
const mongoose = require('mongoose');



const MaterialSchema = new mongoose.Schema({
  student_id: { type: String, required:
true },
teacher_id: { type: String, required: true },
title: { type: String, required: true },
description: { type: String, required: true },

  assets: [{ type: String, required: true }],
});

module.exports = mongoose.model('Material', MaterialSchema);
