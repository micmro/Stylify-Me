
/* Module dependencies.*/
var express = require('express')
	, http = require('http')
	, path = require('path')
	, fs = require('fs')
	, childProcess = require('child_process');

/* Variables / Config */
var config = {
	 binPath : "vendor/phantomjs/bin/phantomjs"
	, phantomFilePath : "stylify-crawler.js"
	, screenshotCacheTime : 60000 * 2 //in ms (1000ms = 1 sec)
};

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 5000);
	app.use(express.compress());
	app.use(express.favicon(path.join(__dirname + '/public/favicon.ico'))); 
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));  
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send(500, '<h1>Something\'s gone wrong!</h1><p>Please try to refresh the page</p>');
});


var utils = {
	isValidURL : function(url){
		var urlRegEx = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		if(urlRegEx.test(url)){
			return true;
		}else{
			return false;
		}
	},
	deleteFile : function(filePath){
		try{
			fs.unlink(filePath, function(){
				console.log("file deleted", filePath, arguments);
			});
		}catch(e){
			console.log("ERR:file delete error", e);
		}
	}
}


/* Routes */
app.get('/', function(req, res){
	 //res.render('index', { title: 'Stylify Me' });
	 res.redirect(301, "http://stylifyme.com/");
});

app.get('/about', function(req, res){
	 //res.render('about', { title: 'About Stylify Me' });
	 res.redirect(301, "http://stylifyme.com/about-us.html");
});

app.get('/query', function(req, res){
	var referer = req.get("Referer")||"http://stylify.herokuapp.com"
		,jsonResponse = {}
		,url, childArgs;
	if(referer.indexOf("http://stylifyme.com") == 0 || referer.indexOf("http://www.stylifyme.com") == 0 || referer.indexOf("http://stylify.herokuapp.com") == 0 || referer.indexOf("http://localhost:" + app.get('port')) == 0){
		url = req.query["url"];
		if(url && utils.isValidURL(url)){
			childArgs = [config.phantomFilePath, req.query["url"]];			
			
			childProcess.execFile(config.binPath, childArgs, function(err, stdout, stderr) {
				try{
					if(err || stderr){
						console.log(stderr);
						res.jsonp(400, { "error": stderr });
					} else if(stdout.indexOf("ERROR:") === 0 || stdout.indexOf("PHANTOM ERROR:") === 0){
						console.log(stdout);
						res.jsonp(400, { "error": stdout });
					}else{
						jsonResponse = JSON.parse(stdout);
						res.jsonp(jsonResponse);
						//delete thumbnail after a bit
						setTimeout(utils.deleteFile, config.screenshotCacheTime, path.join(__dirname, "public", jsonResponse.thumbPath));
					}
				}catch(e){
					console.log(e);
				}
			});
		}else{
			res.jsonp(400, { "error": 'Invalid or missing "url" parameter' });
			console.log("ERR:Invalid or missing url parameter", url);
		}
	}else{
		res.jsonp(400, { "error": 'Invalid referer' });
		console.log("ERR:Invalid referer:", referer);
	}
});

//Handle 404
/*app.get("[^/temp-img]", function(req, res) {
   // res.redirect(301, "http://stylifyme.com");
});*/

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
