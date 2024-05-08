/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
const cloudinary = require('cloudinary').v2;
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const { filterBodyObj } = require('../utils/helper');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadProductImage = catchAsync(async (req, res) => {
  const result = await cloudinary.uploader.upload(req.body.image, {
    public_id: Date.now(),
    resource_type: 'auto',
  });
  res.json({
    public_id: result.public_id,
    url: result.url,
  });
});

exports.removeProductImage = catchAsync(async (req, res) => {
  await cloudinary.uploader.destroy(req.body.public_id);
  res.json('0k');
});

exports.deleteCloudinaryImage = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  await cloudinary.uploader.destroy(product.photo_id);
  next();
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const allProducts = await Product.find({});
  res.status(200).json({
    status: 'success',
    data: {
      products: allProducts,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      products: product,
    },
  });
});

exports.addProduct = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line camelcase
  const { name, photo, price, public_id } = req.body;
  const newProduct = await Product.create({
    name,
    price,
    photo,
    public_id,
  });
  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const filteredBody = filterBodyObj(
    req.body,
    'name',
    'price',
    'photo',
    'public_id'
  );

  const newProduct = await Product.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: 'success',
    message: 'product deleted',
  });
});

exports.deleteAllProduct = catchAsync(async (req, res, next) => {
  await Product.deleteMany({});
  res.status(201).json({
    status: 'success',
    message: 'All products deleted',
  });
});
