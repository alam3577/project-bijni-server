const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Location name is required'],
    unique: [true, 'A Location name must be unique'],
  },
});

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;
