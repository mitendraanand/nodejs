const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

////////// FAT MODEL and THIN CONTROLLER /////////////
// PUT AS MUCH AS BUSINESS LOGIC AS POSSBILE IN MODEL
// AND KEEP THE CONTROLLER AS THIN AS POSSIBLE WITH
// ONLY APPLICATION LOGIC
//////////////////////////////////////////////////////

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 chars'],
      minlength: [10, 'A tour name must have more or equal 10 chars'],
      //validate: [validator.isAlpha, 'A tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy/medium, difficult'
      }
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    discount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          // so it won't work for update.
          return val < this.price;
        },
        message: 'Discount {{VALUE}} should be below price.'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// virtual property is calculated everytime document is pulled from database
// it doesn't exist in db.
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7; // arrow function does not get this key word so  regular function.
});

// PRE DOCUMENT MIDDLEWARE: runs before the .save() command .create() command but not on .insertMany()
tourSchema.pre('save', function(next) {
  // A slug is a human-readable, unique identifier, used to identify a resource
  // instead of a less human-readable identifier like an id .
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('will save document');
//   next();
// })

// // POST DOCUMENT MIDDLEWARE
// tourSchema.post('save', function(doc, next) {

//   next();
// })

// QUERY MIDDLEWARE: will be called before quey related methods like .find()
// This middleware is to only find non secret tours when there is find() call.
// RegEx: all the strings that start with find.
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  //console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // unshift() adds item at beginning of array.
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// const testTour = new Tour({
//   name: 'The Park Hiker',
//   rating: 4.7,
//   price: 497
// });

// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log(`ERROR: ${err}`);
//   });
