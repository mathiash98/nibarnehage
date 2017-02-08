console.log('Hello from innlegg.js');
var mongoose = require('mongoose');

var innleggSchema = new mongoose.Schema({
  name: {type: String, required: true},
  data: {type: String, required: true},
  added: { type: Date, default: Date.now },
  edited: { type: Date, default: Date.now }
},{collection: "innlegg"});

// on every save, add the date
innleggSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  // change the updated_at field to current date
  this.updated_at = currentDate;
  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

module.exports = mongoose.model('Innlegg', innleggSchema);
