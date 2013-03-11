
/* Module dependencies.*/
var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , childProcess = require('child_process')

/* Variables / Config */
var config = {
   binPath : "vendor/phantomjs/bin/phantomjs"
  , phantomFilePath : "stylify-crawler.js"
  , screenshotCacheTime : 5000 //in ms (1000ms = 1 sec)
};

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.compress());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
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
    fs.unlink(filePath, function(){
      console.log("file deleted", filePath, arguments);
    });
  }
}


/* Routes */
app.get('/', function(req, res){
   res.render('index', { title: 'Stylify' });
});

app.get('/about', function(req, res){
   res.render('index', { title: 'About Stylify' });
});

app.get('/query', function(req, res){
  var url = req.query["url"];
  if(url && utils.isValidURL(url)){
    var childArgs = [config.phantomFilePath, req.query["url"]];
    var jsonResponse = {};
    childProcess.execFile(config.binPath, childArgs, function(err, stdout, stderr) {
      if(err || stderr){
        res.json(400, { "error": stderr })
      } else{
        jsonResponse = JSON.parse(stdout);
        res.json(jsonResponse);
        //delete thumbnail after a bit
        setTimeout(utils.deleteFile, config.screenshotCacheTime, path.join(__dirname, "public", jsonResponse.thumbPath));
      }
    });
  }else{
    res.json(400, { "error": 'Invalid or missing "url" parameter' })
  }
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
