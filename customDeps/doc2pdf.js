const req = require('request');

module.exports = function (buf, filename, mimetype, callback) {
	console.log('doc2pdf is alive');
	var r = req.post('http://mirror1.convertonlinefree.com', {
		encoding: null,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.94 Safari/537.36'
		}
	}, function(err, res) {
		if (err) return callback(err);
		callback(null, res.body);
	});

	var form = r.form();
	form.append('__EVENTTARGET', '');
	form.append('__EVENTARGUMENT', '');
	form.append('__VIEWSTATE', '');
	form.append('ctl00$MainContent$fu', buf, {
		filename: filename,
		contentType: mimetype
	});

	form.append('ctl00$MainContent$btnConvert', 'Convert');
	form.append('ctl00$MainContent$fuZip', '');
};
