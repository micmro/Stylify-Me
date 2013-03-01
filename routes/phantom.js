
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
		var filePath = path.join(__dirname, '../phantom_files/color-crawler.js');
	  	var childArgs = [
		  filePath,
		  req.query["url"]
		];
	  	childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
	  		res.send('PHANTOM SAYS('+url+'):' + filePath + ' ' + stdout);
		});
  	}else{
  		res.send('INVALID URL!');
  	}
};