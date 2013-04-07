"use strict";
var	page = require('webpage').create(),
	args = require('system').args,
	address;

/*phantom settings*/
phantom.cookiesEnabled = false;
/*request and render settings*/
page.zoomFactor = 1;
page.viewportSize = { width: 1024, height: 768 };
var config = {
	tempImgPath : "public/temp-img/",
	jQueryPath : "lib/jquery.1.8.3.min.js"
};


page.onConsoleMessage = function (msg) { 
	if (msg.indexOf("Unsafe JavaScript attempt to access frame with URL") > -1){
		return; 
	}
	console.log('CONSOLE: ' + msg);
};
page.onAlert = function (msg) {
	//ignore alerts
	//console.log('ALERT: ' + msg);
};
/*error tracing*/
page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file||t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
	//phantom.exit();
	return;
};

phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file||t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
	phantom.exit();
};


var utils = {
	makeFilename : function(url){
		return  url.replace(/http:\/\//,"").replace(/[\/:/]/g,"_");
	},
	isValidURL : function(url) {
		var urlRegEx = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		if(urlRegEx.test(url)){
			return true;
		}else{
			return false;
		}
	}
};

//alalize the styles
function parsePage (page, address){
	return page.evaluate(function () {
		var $jq = window.jQuery;
    	$jq.noConflict();



		var images = $jq("img");
		var imgPaths = [];
		if(images.length >= 3){
			imgPaths.push(images[parseInt(images.length/2)-1].src);
			imgPaths.push(images[parseInt(images.length/2)].src);
			imgPaths.push(images[parseInt(images.length/2)+1].src);
		}else{
			images.each(function(i, el){
				imgPaths.push(el.src);
			});
		}



		$jq.fn.exists = function(){
			if(this.length>0){
			    return this;
			}else{
				return false; 
			}
		};

		

		var baseSelector = ($jq("[role=main]").exists()||$jq("#main").exists()||$jq("#content").exists()||$jq(document.body));
		var h1 = (baseSelector.find("h1:first").exists()||$jq("h1:first"));
		var h2 = (baseSelector.find("h2:first").exists()||$jq("h2:first"));
		var h3 = (baseSelector.find("h3:first").exists()||$jq("h3:first"));
		var h4 = (baseSelector.find("h4:first").exists()||$jq("h4:first"));
		var h5 = (baseSelector.find("h5:first").exists()||$jq("h5:first"));
		var h6 = (baseSelector.find("h6:first").exists()||$jq("h6:first"));
		var p = (baseSelector.find("p:first").exists()||$jq("p:first"));
		var a = (baseSelector.find("a:first").exists()||$jq("a:first"));
		var body = $jq(document.body);
		var naMsg = "N/A";

		
		var colours = [];
		var coloursNumPair = {};
		var coloursReturn = [];
		//color properties to iterate through
		var colorProperties = ["color", "background-color"];
		var color;
		var result = {};

		//iterate through every element
		$jq('*').each(function(i,el) {
			color = null;
			el = $jq(el);
			$jq.each(colorProperties, function(j,prop){
				//if we can't find this property or it's null, continue
				if (!el.css(prop)) {
					return true;
				}
				//create RGBColor object
				color = el.css(prop);

				//colours.push(color);
				if(coloursNumPair[color]){
					coloursNumPair[color] = coloursNumPair[color]+1;
				}else{
					coloursNumPair[color] = 1;
					colours.push(color);
				}
			});
			
		});
		
		$jq.each(colours, function(i,el){
			coloursReturn.push([el,coloursNumPair[el]]);
		});


		return {
			"title" : document.title
			, "colours" : coloursReturn
			, "h1-text-colour" : h1.css("color")||naMsg
			, "h2-text-colour" : h2.css("color")||naMsg
			, "h3-text-colour" : h3.css("color")||naMsg
			, "h4-text-colour" : h4.css("color")||naMsg
			, "h5-text-colour" : h5.css("color")||naMsg
			, "h6-text-colour" : h6.css("color")||naMsg

			, "h1-font" : h1.css("font-family")||naMsg
			, "h2-font" : h2.css("font-family")||naMsg
			, "h3-font" : h3.css("font-family")||naMsg
			, "h4-font" : h4.css("font-family")||naMsg
			, "h5-font" : h5.css("font-family")||naMsg
			, "h6-font" : h6.css("font-family")||naMsg
			
			, "h1-font-size" : h1.css("font-size")||naMsg
			, "h2-font-size" : h2.css("font-size")||naMsg
			, "h3-font-size" : h3.css("font-size")||naMsg
			, "h4-font-size" : h4.css("font-size")||naMsg
			, "h5-font-size" : h5.css("font-size")||naMsg
			, "h6-font-size" : h6.css("font-size")||naMsg
			
			, "h1-leading" : h1.css("line-height")||naMsg
			, "h2-leading" : h2.css("line-height")||naMsg
			, "h3-leading" : h3.css("line-height")||naMsg
			, "h4-leading" : h4.css("line-height")||naMsg
			, "h5-leading" : h5.css("line-height")||naMsg
			, "h6-leading" : h6.css("line-height")||naMsg
			
			, "h1-font-style" : h1.css("font-style")||naMsg
			, "h2-font-style" : h2.css("font-style")||naMsg
			, "h3-font-style" : h3.css("font-style")||naMsg
			, "h4-font-style" : h4.css("font-style")||naMsg
			, "h5-font-style" : h5.css("font-style")||naMsg
			, "h6-font-style" : h6.css("font-style")||naMsg

			, "base-text-colour" : baseSelector.css("color")||naMsg
			, "base-font" : baseSelector.css("font-family")||naMsg
			, "base-font-size" : baseSelector.css("font-size")||naMsg
			, "base-leading" : baseSelector.css("line-height")||naMsg
			, "base-font-style" : baseSelector.css("font-style")||naMsg
			
			, "p-text-colour" : p.css("color")||naMsg
			, "a-text-colour" : a.css("color")||naMsg		
			, "main-background-colour" : baseSelector.css("background-color")||naMsg
			, "background-img" : body.css("background-image")||naMsg
			, "background-colour" : body.css("background-color")||naMsg
			, "img-paths" : imgPaths||naMsg
			
		};
	});
};


try{
	//main
	if (args.length === 0) {
	    console.log('Usage: color-crawler.js <some URL>');
	    phantom.exit();
	}else{
		address = args[1];
		if(utils.isValidURL(address)){	
			page.open(address, function (status) {	    
			    if (status == 'success'){
		        	//delay analizing a bit
		        	window.setTimeout(function () {
			        	if(page.injectJs(config.jQueryPath)){    				
				    		var result = parsePage(page, address)
				    			,imgPath = config.tempImgPath + utils.makeFilename(address) + "_" + new Date().getTime().toString() + '.png';
				    		if(!result){
				    			console.log("ERROR: COULD NOT PARSE SITE");
								phantom.exit();
				    		} 

							result.thumbPath =  imgPath.replace("public/", "");

							//return result and save screen
							console.log(JSON.stringify(result));						
							page.render(imgPath);
				    		//phantom.exit(JSON.stringify(result));
				    		phantom.exit();
						}else{
							console.log("ERROR: COULD NOT LOAD JQUERY");
							phantom.exit();
						}
					}, 200);
				}else{
		            console.log('ERROR:FAIL to load the address');
		            phantom.exit();
				}
			});	
		} else {
			console.error("ERROR: INVALID URL");
			phantom.exit();
		}
	}
}catch(e){
	console.error("ERROR: " + e);
	phantom.exit();
}