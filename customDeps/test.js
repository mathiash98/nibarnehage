var Busboy, Files, GridStream, async, mongoose, secrets, sharp,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

mongoose = require("mongoose");

Busboy = require("busboy");

secrets = require("../config/secrets");

GridStream = require("gridfs-stream");

Files = require("../models/files");

sharp = require("sharp");

async = require("async");

mongoose.connect(secrets.db);

mongoose.connection.on("error", function(err) {
  return console.log("Mongoose Driver: Connection Error " + err + ".");
});

mongoose.connection.on("connected", function() {
  return console.log("Mongoose Driver: connected!.");
});

mongoose.connection.on("disconnected", function() {
  return console.log("Mongoose Driver: disconnected!");
});

process.on('SIGINT', function() {
  mongoose.connection.close(function() {
    return console.log("Mongoose Driver: connection closed on SIGINT app shutdown.");
  });
  return process.exit(0);
});

exports.getFileBlob = function(req, res) {
  var stream;
  if (!req.user) {
    return res.status(401).json();
  }
  stream = Files.streamFileById(req.params.id);
  return stream.pipe(res);
};

exports.getFilesByUser = function(req, res) {
  if (!req.user) {
    return res.status(401).json({
      status: 'Unauthorized'
    });
  }
  return Files.findByUser(req.user._id, function(err, files) {
    if (err) {
      return res.status(500).json({
        status: err
      });
    }
    return res.status(200).json(files);
  });
};

exports.mongodbUpload = function(req, res, next) {
  var FIELDS, busboy, fieldValues, gridStream;
  FIELDS = ['title', 'tag'];
  fieldValues = {};
  gridStream = new GridStream(mongoose.connection.db, mongoose.mongo);
  busboy = new Busboy({
    headers: req.headers,
    limits: {
      fileSize: 1024 * 1024 * 15,
      files: 1
    }
  });

  busboy.on('field', function(fieldname, val, fieldNameTrunc, valTrunc) {
    console.log("busboy-field-event", fieldname, val);
    if (indexOf.call(FIELDS, fieldname) >= 0) {
      return fieldValues[fieldname] = val;
    }
  });

  busboy.on("file", function(fieldname, stream, filename, encoding, mimetype) {
    console.log("busboy-file-event", fieldname, filename, encoding, mimetype);

    return async.parallel({
      raw: function(done) {
        var writestream;
        writestream = gridStream.createWriteStream({
          mode: "w",
          filename: filename,
          content_type: mimetype,
          metadata: {
            userid: req.user._id,
            fields: fieldValues,
            encoding: encoding,
            size: 'raw'
          }
        });
        writestream.on("close", function(file) {
          console.log("writestream-file-close", Date.now());
          return done(null, file);
        });
        return stream.pipe(writestream);
      },

      desktop: function(done) {
        var transformer, writestream;
        transformer = sharp().resize(1024, 768).crop(sharp.gravity.north);
        writestream = gridStream.createWriteStream({
          mode: "w",
          filename: filename,
          content_type: mimetype,
          metadata: {
            userid: req.user._id,
            fields: fieldValues,
            encoding: encoding,
            size: 'desktop'
          }
        });
        writestream.on("close", function(file) {
          console.log("writestream-file-close", Date.now());
          return done(null, file);
        });
        return stream.pipe(transformer).pipe(writestream);
      },

      mobile: function(done) {
        var transformer, writestream;
        transformer = sharp().resize(320, 180).crop(sharp.gravity.north);
        writestream = gridStream.createWriteStream({
          mode: "w",
          filename: filename,
          content_type: mimetype,
          metadata: {
            userid: req.user._id,
            fields: fieldValues,
            encoding: encoding,
            size: 'mobile'
          }
        });

        writestream.on("close", function(file) {
          console.log("writestream-file-close", Date.now());
          return done(null, file);
        });

        return stream.pipe(transformer).pipe(writestream);
      },


      thumb: function(done) {
        var transformer, writestream;
        transformer = sharp().resize(60).crop(sharp.gravity.north);
        writestream = gridStream.createWriteStream({
          mode: "w",
          filename: filename,
          content_type: mimetype,
          metadata: {
            userid: req.user._id,
            fields: fieldValues,
            encoding: encoding,
            size: 'thumb'
          }
        });
        writestream.on("close", function(file) {
          console.log("writestream-file-close", Date.now());
          return done(null, file);
        });
        return stream.pipe(transformer).pipe(writestream);
      }
    }, function(err, parResult) {
      var fileMap;
      if (err) {
        return res.status(501).json();
      }
      fileMap = {
        raw: parResult.raw,
        desktop: parResult.desktop,
        mobile: parResult.mobile,
        thumb: parResult.thumb
      };
      return req.user.addFile(fileMap, function(err, result) {
        if (err) {
          return res.status(500).json();
        }
        console.log("writestream-file-close", Date.now());
        return res.status(201).json({
          fileMap: fileMap
        });
      });
    });
  });
  busboy.on("finish", function() {
    req.user.fileCacheTime = Date.now();
    return console.log("busboy-finish", req.user.fileCacheTime);
  });
  busboy.on("error", function(err) {
    return console.log("busboy-error", err);
  });
  return req.pipe(busboy);
};

// ---
// generated by coffee-script 1.9.2
