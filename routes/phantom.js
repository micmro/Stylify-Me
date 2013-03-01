
/*
 * GET pahntom response
 */

var childProcess = require('child_process'),
	path = require('path'),
	binPath = "vendor/phantomjs/bin/phantomjs";

exports.query = function(req, res){
  	var childArgs = [
	  path.join(__dirname, 'phantom_files/color-crawler.js'),
	  req.query["url"]
	]
  	childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
  		res.send('PHANTOM SAYS:' + stdout);
	})
};