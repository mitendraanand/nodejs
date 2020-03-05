const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

////////// FAT MODEL and THIN CONTROLLER /////////////
// PUT AS MUCH AS BUSINESS LOGIC AS POSSBILE IN MODEL
// AND KEEP THE CONTROLLER AS THIN AS POSSIBLE WITH
// ONLY APPLICATION LOGIC
//////////////////////////////////////////////////////

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name']
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide valid email']
    },
    photo: {
      type: String
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'A user must have a confirm password'],
      validate: {
        // This only works on SAVE!!!
        validator: function(el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!'
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// MIDDLEWARE for Password ENCRYPTION/HASHING if password was modified.
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  // HASH the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the password confirm
  this.passwordConfirm = undefined;

  next();
});

// MIDDLEWARE to store the password change timestamp
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000; // Some time DB save takes longer than JWT token generations so offsetting a bit.
  next();
});

// MIDDLEWARE to kick in before any find
userSchema.pre(/^find/g, function(next) {
  // This points to current query.
  this.find({ active: { $ne: false } });
  next();
});

// This is how you create instance method by using classname.method.
// THis is done because login will have concrete user from db for password validation.
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // Can't compare like string as candidatePassword is plain text but userPassword is hashed.
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log(
    `resetToken: ${resetToken} hashedToken: ${this.passwordResetToken} passwordResetExpires: ${this.passwordResetExpires}`
  );

  // We will send the plain text to user's email for password reset.
  // Encrypted one will remain in db for validation, similar to how
  // we store only encrypted password of any user.
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
