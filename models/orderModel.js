const mongoose = require('mongoose');
// const User = require('./authModel');

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'For Booking Slot, Name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone Number is Required'],
    },
    sellingType: {
      type: String,
      required: [true, 'Select selling Type'],
    },
    location: {
      type: String,
      required: [true, 'Select Location'],
    },
    date: {
      type: Date,
      required: [true, 'date is required'],
    },
    time: {
      type: String,
      required: [true, 'time is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    selectedSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
