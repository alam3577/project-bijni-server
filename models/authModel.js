const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    minlength: [3, 'A user name must be atleast 3 words'],
    maxlength: [20, 'A user name must be less then 20 words'],
  },

  // email: {
  //   type: String,
  //   required: [true, 'A user must have an email'],
  //   validate: {
  //     validator: function (v) {
  //       return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(v);
  //     },
  //     message: (props) => `${props.value} is not a valid email address!`,
  //   },
  // },

  phone: {
    type: String,
    required: [true, 'A user must have an Phone Number'],
    unique: [true, 'phone n0. is already used, please enter new number'],
    validate: {
      validator: function (v) {
        // eslint-disable-next-line no-useless-escape
        return /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid mobile number!`,
    },
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'password required'],
    minlength: [2, 'A password must be greater then 5 character'],
    maxlength: [20, 'A password must be less then 20 character'],
  },

  confirmPassword: {
    type: String,
    required: [true, 'Confirm your password'],
    minlength: [2, 'A password must be greater then 2 character'],
    maxlength: [20, 'A password must be less then 20 character'],
    validate: {
      validator: function (password) {
        return this.password === password;
      },
      message: 'Password is Not matched',
    },
  },

  isActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  otp: {
    type: String,
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  OTPExpires: Date,
});

//don't save compare password to db
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

//compare the bcrypt and actual password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 4.Check if user changed password after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    const checker = JWTTimeStamp < changedTimeStamp;
    return checker;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
