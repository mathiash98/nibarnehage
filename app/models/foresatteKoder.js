console.log('Hello from foresatteKoder.js');
var mongoose = require('mongoose');

var foresatteKoderSchema = new mongoose.Schema({
  code: {type: String, required: true},
  expire: {type: Date},
  added: { type: Date, default: Date.now },
  edited: { type: Date, default: Date.now }
},{collection: "foresatteKoder"});

// on every save, add the date
foresatteKoderSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  // change the updated_at field to current date
  this.updated_at = currentDate;
  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

module.exports = mongoose.model('ForesatteKoder', foresatteKoderSchema);
