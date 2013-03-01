
/*
 * GET users listing.
 */

var childProcess = require('child_process')
var binPath = "vendor/phantomjs/bin/phantomjs"//LD_LIBRARY_PATH

exports.query = function(req, res){
  	var childArgs = [
	  path.join(__dirname, 'phantom_files/color-crawler.js'),
	  req.query["url"]
	]
  	childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
  		res.send('PHANTOM SAYS:' + stdout);
	})
};