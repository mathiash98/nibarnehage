console.log('Hello from bilde.js');
var mongoose = require('mongoose');
var Album = require('./album.js');

var bildeSchema = new mongoose.Schema({
  album: {type: mongoose.Schema.Types.ObjectId, ref: 'Album'},
  img: {data: Buffer, contentType: String},
  added: { type: Date, default: Date.now },
  edited: { type: Date, default: Date.now }
},{collection: "bilder"});

// on every save, add the date
bildeSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  // change the updated_at field to current date
  this.updated_at = currentDate;
  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

module.exports = mongoose.model('Bilde', bildeSchema);
