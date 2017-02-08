console.log('Hello from album.js');
var mongoose = require('mongoose');

var albumSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, default: String},
  imgs: {type: Array},
  added: { type: Date, default: Date.now },
  edited: { type: Date, default: Date.now }
}, {collection: "album"});

// on every save, add the date
albumSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  // change the updated_at field to current date
  this.updated_at = currentDate;
  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

module.exports = mongoose.model('Album', albumSchema);
