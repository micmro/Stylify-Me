var express = require('express');

var app = express.createServer(express.logger());
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = "vendor/phantomjs/bin/phantomjs"//phantomjs.path //LD_LIBRARY_PATH






app.get('/', function(request, response) {
  	response.send('Hello World!')
});

app.get('/testA', function(request, response) {
	response.send('Hi there')
}

app.get('/testB', function(request, response) {
  	var childArgs = [
	  path.join(__dirname, 'color-crawler.js'),
	  'http://google.com'
	]
  	childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
  		response.send('Hello World!' + stdout)
	})
});

app.get('/testC', function(request, response) {
  	var childArgs = [
	  path.join(__dirname, 'color-crawler.js'),
	  'http://google.com'
	]
  	childProcess.execFile('/vendor/phantomjs/bin/phantomjs', childArgs, function(err, stdout, stderr) {
  		response.send(stdout)
	})
});

app.get('/testD', function(request, response) {
  	var childArgs = [
	  path.join(__dirname, 'color-crawler.js'),
	  'http://google.com'
	]
  	childProcess.execFile(phantomjs.path, childArgs, function(err, stdout, stderr) {
  		response.send(stdout)
	})
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});