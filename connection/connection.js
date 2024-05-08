const mongoose = require('mongoose');
const localDB = process.env.DB_LOCAL;
// const cloudDB = process.env.DB_CLOUD;

mongoose.set('strictQuery', false);
mongoose
  .connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log('DB Connected');
  })
  .catch((err) => console.log('ERROR', err));
