/*

Licence: MIT http://cpage.mit-license.org/

 */


module.exports = function(options){
	// Private:
	var Grid = require('gridfs-stream');
	var sharp = require('sharp');
	var conn;
	if(options.mongoose){
		Grid.mongo = options.mongoose.mongo;
		conn = options.mongoose.connection;
	}else{
		Grid.mongo = options.mongo;
		conn = {db:options.db};
	}
	// Public:
	return function(req, res, next){
		if(!options.mongoose || conn.readyState == 1){
			if(!req.is("multipart/form-data"))
				return next();

			if(!req.body)
				req.body = {};

			var files = [];
			var streams_response = 0;

			var busboy = new (require("busboy"))({headers: req.headers});
			var gfs = Grid(conn.db);

			// Handle files. they will be automatically sent to GridFS with thier filename.
			// In req.body.files will be a array that contains the ID and filename of each file stored.
			//Parses fields in the normal req.body way.
			busboy.on("field",function(fieldname, val, fieldnameTruncated, valTruncated){
				req.body[fieldname] = val;
			});

			busboy.on("file", function(fieldname, file, filename, encoding, mimetype){
		    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
				var writeStream = gfs.createWriteStream({
					filename:filename,
					metadata:{
						mimetype:mimetype,
						encoding:encoding
					}
				});
				streams_response++;

				file.pipe(sharp().rotate().resize(1500,1000).max()).pipe(writeStream)
				.on('close', function (file) {
					console.log(file.filename,'closed');
					files.push({_id:file._id,filename:file.filename});
					streams_response--;
					if (streams_response ===0) {
						req.body.files = files;
						next();
					}
				});

			});

			busboy.on('finish',function(){
				if (streams_response===0) {
					req.body.files = files;
					next();
				} else {
				}
			});
			req.pipe(busboy);
		}
	};
};
