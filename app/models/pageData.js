console.log('Hello from pageData.js');
var mongoose = require('mongoose');

var pageDataSchema = new mongoose.Schema({
  name: {type: String, unique: true, required: true},
  textBoxes: {type: Object, required: true},
  added: { type: Date, default: Date.now },
  edited: { type: Date, default: Date.now }
},{collection: 'pagedata'});

// on every save, add the date
pageDataSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  // change the updated_at field to current date
  this.updated_at = currentDate;
  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

module.exports = mongoose.model('PageData', pageDataSchema);
