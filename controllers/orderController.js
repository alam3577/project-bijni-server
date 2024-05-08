const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');

exports.addOrders = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const newOrder = await Order.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      orders: newOrder,
    },
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  // const allOrders = await Order.find({}).populate('user', 'name phone');
  const allOrders = await Order.aggregate([
    {
      $lookup: {
        from: 'users',
        let: { user_id: '$user' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$_id', '$$user_id'] }] } } },
        ],
        as: 'order',
      },
    },
    {
      $unwind: {
        path: '$order',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        registeredName: '$order.name',
        registeredPhone: '$order.phone',
      },
    },
    {
      $project: {
        order: 0,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      orders: allOrders,
    },
  });
});

exports.deleteOrders = catchAsync(async (req, res, next) => {
  await Order.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Oder Deleted',
  });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const order = await Order.aggregate([
    {
      $match: {
        $expr: { $eq: ['$user', userId] },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// db.orders.aggregate([
//   {
//     $group: {
//        _id: "$selectedSlot",
//        count: { $count: { } }
//     }
//   }
//   ]);

// db.orders.aggregate([
//   {
//     $group: {
//       _id: "$selectedSlot" ,
//        count: { $sum: 1 }
//     }
//   },
//   {
//     $project:
//            {
//              count: 1,
//              isValid:
//                {
//                  $cond: { if: { $lte: [ "$count", 3 ] }, then: true, else: false }
//                }
//     }
//   },
//   {
//     $lookup:
//          {
//            from: "slots",
//            let: { slot_id: "$_id" },
//            pipeline: [
//               { $match:
//                  { $expr:
//                     { $and:
//                        [
//                          { $eq: [ "$_id",  "$$slot_id" ] },
//                        ]
//                     }
//                  }
//               },
//            ],
//            as: "slots"
//          }
//   }
// ])
