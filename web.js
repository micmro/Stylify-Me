var express = require('express');

var app = express.createServer(express.logger());
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path

app.get('/', function(request, response) {
  	



	var childArgs = [
	  path.join(__dirname, 'color-crawler.js'),
	  'http://google.com'
	]

	childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
	  // handle results
	  response.send('Hello World!' + stdout);
	})
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});