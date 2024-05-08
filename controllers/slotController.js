// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment/moment');
const Slot = require('../models/slotsModel');
const catchAsync = require('../utils/catchAsync');
const { filterBodyObj } = require('../utils/helper');

exports.getSlots = catchAsync(async (req, res, next) => {
  const allAvailableSlots = await Slot.aggregate([
    {
      $sort: {
        startTime: 1,
        startTimeMeridiem: 1,
        endTime: 1,
        endTimeMeridiem: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      slots: allAvailableSlots,
    },
  });
});

exports.getSlotsForUser = catchAsync(async (req, res, next) => {
  const selDate = req.params.date;
  const momentDate1 = moment(selDate).utc();
  const slots = await Slot.aggregate([
    {
      $lookup: {
        from: 'orders',
        let: { slot_id: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$selectedSlot', '$$slot_id'] },
                  {
                    $eq: [momentDate1._d, '$date'],
                  },
                ],
              },
            },
          },
        ],
        as: 'order',
      },
    },
    {
      $addFields: {
        isValid: {
          $cond: {
            if: { $lte: [{ $size: '$order' }, 3] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        order: 0,
      },
    },
    {
      $sort: {
        startTime: 1,
        startTimeMeridiem: 1,
        endTime: 1,
        endTimeMeridiem: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      slots,
    },
  });
});

exports.getSlot = catchAsync(async (req, res, next) => {
  const slot = await Slot.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      slot,
    },
  });
});

exports.addSlot = catchAsync(async (req, res, next) => {
  const {
    startTime,
    endTime,
    meridiem,
    isSlotFull,
    startTimeMeridiem,
    endTimeMeridiem,
  } = req.body;

  const slot = await Slot.create({
    startTime,
    endTime,
    meridiem,
    isSlotFull,
    startTimeMeridiem,
    endTimeMeridiem,
  });

  res.status(200).json({
    status: 'success',
    data: {
      slot,
    },
  });
});

exports.updateSlot = catchAsync(async (req, res, next) => {
  const filteredBody = filterBodyObj(
    req.body,
    'startTime',
    'endTime',
    'startTimeMeridiem',
    'endTimeMeridiem',
    'isSlotFull'
  );

  const slot = await Slot.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'your slot is updated',
    data: {
      slot,
    },
  });
});

exports.deleteSlot = catchAsync(async (req, res, next) => {
  const slot = await Slot.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      slot,
    },
  });
});
