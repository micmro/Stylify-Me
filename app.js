
/* Module dependencies.*/
var express = require('express')
	, http = require('http')
	, path = require('path')
	, fs = require('fs')
	, childProcess = require('child_process');

/* Variables / Config */
var config = {
	 binPath : "vendor/phantomjs/bin/phantomjs"
	, crawlerFilePath : "stylify-crawler.js"
	, rasterizeFilePath : "phantom-rasterize.js"
	, screenshotCacheTime : 60000 * 1 //in ms (1000ms = 1 sec)
};

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 5000);
	app.use(express.compress());
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
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
	},
	isRefererValid : function(referer){
		var validRefs = ["http://stylifyme.com", "http://www.stylifyme.com", "http://stylify.herokuapp.com", "http://localhost:9185", "http://localhost:" + app.get('port')]
			,isvalid = false;
		for(valRef in validRefs){
			if(referer.indexOf(validRefs[valRef]) == 0){
				isvalid = true;
				return true;
			}
		}
		if(!isvalid){
			console.log("ERR:Invalid referer:", referer);
		}
		return isvalid;
	},
	parsePhantomResponse : function(err, stdout, stderr, onsuccess, onerror){
		var jsonResponse = {};
		try{
			if(err || stderr){
				console.log("ERR:PHANTOM>",stderr);
				onerror(stdout);
			} else if(stdout.indexOf("ERROR:") === 0 || stdout.indexOf("PHANTOM ERROR:") === 0){
				console.log("ERR:PHANTOM>", stdout);
				onerror(stdout);
			} else if (stdout.indexOf("CONSOLE:") === 0) {
				jsonResponse = JSON.parse(stdout.replace(/(CONSOLE:).*[\n\r]/gi,""));
				onsuccess(jsonResponse);
				//delete thumbnail after a bit
				setTimeout(utils.deleteFile, config.screenshotCacheTime, path.join(__dirname, "public", jsonResponse.thumbPath));
			}else{
				jsonResponse = JSON.parse(stdout);
				onsuccess(jsonResponse);
				//delete thumbnail after a bit
				setTimeout(utils.deleteFile, config.screenshotCacheTime, path.join(__dirname, "public", jsonResponse.thumbPath));
			}
		}catch(e){
			console.log(e);
		}
	},
	makeFilename : function(url){
		return  url.replace(/http:\/\//,"").replace(/[\/:/]/g,"_");
	}
}


/* Routes */
app.get('/', function(req, res){
	 res.redirect(301, "http://stylifyme.com/");
});

app.get('/about', function(req, res){
	 res.redirect(301, "http://stylifyme.com/about-us.html");
});

//renders html for PDF
app.get('/renderpdfview', function(req, res){
	var referer = req.get("Referer")||"http://stylify.herokuapp.com"
		,jsonResponse = {}
		,showImage = true
		,debugMode = false
		,url, childArgs;
	if(utils.isRefererValid(referer)){
		url = req.query["url"];
		if(url && utils.isValidURL(url)){
			childArgs = [config.crawlerFilePath, req.query["url"], showImage, debugMode];			
			
			childProcess.execFile(config.binPath, childArgs, function(err, stdout, stderr) {
					utils.parsePhantomResponse(err, stdout, stderr,function(jsonResponse){
						res.render('pdfbase', { title: 'Stylify Me - Extract', pageUrl: url, data : jsonResponse });
					}
					,function(stdout){
						res.jsonp(503, { "error": stdout });
					});
			});
		}else{
			res.jsonp(400, { "error": 'Invalid or missing "url" parameter' });
			console.log("ERR:Invalid or missing url parameter", url);
		}
	}else{
		res.jsonp(400, { "error": 'Invalid referer' });
	}
});

//returns PDF file
app.get('/getpdf', function(req, res){
	var referer = req.get("Referer")||"http://stylify.herokuapp.com"
		,url, childArgs, filename;
	if(utils.isRefererValid(referer)){
		url = req.query["url"];
		if(url && utils.isValidURL(url)){
			filename = "/public/pdf/temp" + utils.makeFilename(url) + "_" + new Date().getTime().toString() + ".pdf";
			childArgs = [config.rasterizeFilePath, req.protocol + "://" + req.get('host') + "/renderpdfview?url="+url, filename, "A4"];			
			
			childProcess.execFile(config.binPath, childArgs, function(err, stdout, stderr) {
				console.log("LOG: CREATED PDF", filename);
				res.download(filename, "stylify-me_"+utils.makeFilename(url)+".pdf", function(err){
					utils.deleteFile(filename);
				});
			});
		}else{
			res.jsonp(400, { "error": 'Invalid or missing "url" parameter' });
			console.log("ERR:Invalid or missing url parameter", url);
		}
	}else{
		res.jsonp(400, { "error": 'Invalid referer' });
	}
});

app.get('/getpdfTest', function(req, res){
	var referer = req.get("Referer")||"http://stylify.herokuapp.com"
		,url, childArgs, filename;
	if(utils.isRefererValid(referer)){
		url = req.query["url"];
		if(url && utils.isValidURL(url)){
			filename = "/public/pdf/temp" + utils.makeFilename(url) + "_" + new Date().getTime().toString() + ".jpg";
			childArgs = [config.rasterizeFilePath, url, filename, "A4"];
			
			childProcess.execFile(config.binPath, childArgs, function(err, stdout, stderr) {
				console.log("LOG: CREATED PDF", filename);
				res.download(filename, "stylify-me_"+utils.makeFilename(url)+".jpg", function(err){
					utils.deleteFile(filename);
				});
			});
		}else{
			res.jsonp(400, { "error": 'Invalid or missing "url" parameter' });
			console.log("ERR:Invalid or missing url parameter", url);
		}
	}else{
		res.jsonp(400, { "error": 'Invalid referer' });
	}
});


//returns stylify json
app.get('/query', function(req, res){
	var referer = req.get("Referer")||"http://stylify.herokuapp.com"
		,jsonResponse = {}
		,showImage = true
		,debugMode = false
		,url, childArgs;
	if(utils.isRefererValid(referer)){
		url = req.query["url"];
		if(url && utils.isValidURL(url)){
			childArgs = [config.crawlerFilePath, req.query["url"], showImage, debugMode];			
			
			childProcess.execFile(config.binPath, childArgs, function(err, stdout, stderr) {
					utils.parsePhantomResponse(err, stdout, stderr,function(jsonResponse){
						res.jsonp(jsonResponse);
					}
					,function(stdout){
						res.jsonp(503, { "error": stdout });
					});
			});
		}else{
			res.jsonp(400, { "error": 'Invalid or missing "url" parameter' });
			console.log("ERR:Invalid or missing url parameter", url);
		}
	}else{
		res.jsonp(400, { "error": 'Invalid referer' });
	}
});

//Handle 404
/*app.get("[^/temp-img]", function(req, res) {
   // res.redirect(301, "http://stylifyme.com");
});*/

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
