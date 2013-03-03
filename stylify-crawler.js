var	page = require('webpage').create(),
	args = require('system').args,
	address;

console.log("START color-crawler");
/*phantom settings*/
phantom.cookiesEnabled = false;
/*request and render settings*/
page.zoomFactor = 0.25;
page.viewportSize = { width: 1024, height: 768 };


/*error tracing*/
phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
};


var utils = {
	makeFilename : function(url){
		return  url.replace(/http:\/\//,"").replace(/[\/:/]/g,"_");
	}
};

var processing = {
	parsePage : function(page){
		var pageAttributes = page.evaluate(function () {

			return {
				"title" : document.title
				, "h1-text-colour" : $("h1").css("color") 
				, "h2-text-colour" : $("h2").css("color")
				, "h3-text-colour" : $("h3").css("color") 
				, "h4-text-colour" : $("h4").css("color") 
				, "p-text-colour" : $("p").css("color") 
				, "base-text-colour" : $("body").css("color") 
				, "base-font-family" : $("body").css("font-family")
				, "background-colour" : $("body").css("background-color")
			};
		});

		for(arg in pageAttributes){
			console.log("setting " +  arg + ": " + pageAttributes[arg]);	
		}
		
	}
};






if (args.length === 0) {
    console.log('Usage: color-crawler.js <some URL>');
    phantom.exit();
}else{
	address = args[1];
	page.open(address, function (status) {	    
	    if (status !== 'success') {
            console.log('FAIL to load the address');
            phantom.exit();
        } else {
        	page.render("thumbs/" + utils.makeFilename(address) + '.png');
        	//if(page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js")){
        	if(page.injectJs("lib/jquery.1.8.3.min.js")){
        		console.log("jQuery Loaded");
	    		var result = processing.parsePage(page);
	    		console.log("EXIT color-crawler - SUCCESS");
	    		phantom.exit(result);
			}else{
				console.log("ERROR LOADING JQUERY");
				phantom.exit();
			}
		}
		
	    
	});	 
}