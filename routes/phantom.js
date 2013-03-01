
/*
 * GET pahntom response
 */

var childProcess = require('child_process'),
	path = require('path'),
	binPath = "vendor/phantomjs/bin/phantomjs";


function isValidURL(url){
    var urlRegEx = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    if(urlRegEx.test(url)){
        return true;
    }else{
        return false;
    }
} 

exports.query = function(req, res){
	var url = req.query["url"];
	if(url && isValidURL(url)){
		var filePath = path.join(__dirname, '../public/javascripts/color-crawler.js');
	  	var childArgs = [
		  "color-crawler.js",
		  req.query["url"]
		];
	  	childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
	  		res.send('PHANTOM SAYS('+url+'):'  + '\n' + __dirname + '\n' + '\n' + filePath + '\n' + err + '\n' + stdout + '\n' + stderr);
		});
  	}else{
  		res.send('INVALID URL!');
  	}
};