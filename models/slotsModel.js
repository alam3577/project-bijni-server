const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: [true, 'a slot must have a start time'],
  },
  endTime: {
    type: String,
    required: [true, 'a slot must have a end time'],
  },
  startTimeMeridiem: {
    type: String,
    enum: ['AM', 'PM'],
    required: [true, 'a slot must have meridiem'],
  },
  endTimeMeridiem: {
    type: String,
    enum: ['AM', 'PM'],
    required: [true, 'a slot must have meridiem'],
  },
});

const Slot = mongoose.model('Slot', slotSchema);
module.exports = Slot;
