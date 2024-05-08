const Location = require('../models/locationModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllAvailableLocation = catchAsync(async (req, res, next) => {
  const locations = await Location.find({});
  res.status(200).json({
    status: 'success',
    data: {
      locations,
    },
  });
});

exports.addLocation = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const location = await Location.create({ name });
  res.status(200).json({
    status: 'success',
    data: {
      location,
    },
  });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  await Location.findByIdAndUpdate(
    req.params.id,
    { name },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    message: 'location updated',
  });
});

exports.deleteLocation = catchAsync(async (req, res, next) => {
  await Location.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'location Deleted',
  });
});
