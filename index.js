require('dotenv').config({
  path: './config.env',
});
const express = require('express');
const cors = require('cors');
// eslint-disable-next-line import/no-extraneous-dependencies
const fast2sms = require('fast-two-sms');
const cookieParser = require('cookie-parser');
const productRoute = require('./routes/productRoute');
const locationRoute = require('./routes/locationRoute');
const cloudinaryRoute = require('./routes/cloudinaryRoutes');
const userRoute = require('./routes/userRoute');
const orderRoute = require('./routes/orderRoute');
const slotRoute = require('./routes/slotRoute');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/AppError');

const port = process.env.PORT;

const app = express();

// DB connections
require('./connection/connection');

// middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log({ cook: req.cookies });
  next();
});

// own middleware
app.use('/api/v1/kabadi', productRoute);
app.use('/api/v1/kabadi', locationRoute);
app.use('/api/v1/kabadi', cloudinaryRoute);
app.use('/api/v1/kabadi', userRoute);
app.use('/api/v1/kabadi', orderRoute);
app.use('/api/v1/kabadi', slotRoute);

app.post('/send-message', async (req, res) => {
  const options = {
    authorization: process.env.F2F_API_KEY,
    message: req.body.message,
    numbers: [req.body.number],
  };
  const resData = await fast2sms.sendMessage(options);
  res.status(200).json({
    data: resData,
  });
});

// handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

// global error handler
app.use(globalErrorHandler);

console.log({ en: process.env.NODE_ENV });

// assign the server
app.listen(port, () => {
  console.log('server is running to the port of', port);
});
