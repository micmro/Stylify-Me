var express = require('express');
var path = require('path');

var app = express.createServer(express.logger());
var childProcess = require('child_process')
var binPath = "vendor/phantomjs/bin/phantomjs"//LD_LIBRARY_PATH






app.get('/', function(request, response) {
  	response.send('Hello World!');
});

app.get('/query', function(request, response) {
  	var childArgs = [
	  path.join(__dirname, 'phantom_files/color-crawler.js'),
	  req.query["url"]
	]
  	childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
  		response.send('Hello World!' + stdout);
	})
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});