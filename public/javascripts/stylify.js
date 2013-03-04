"use strict";

(function($){

	window.stlfy = {
		util : {
			isUrl : function(url){ 
				return url.match(/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi);
			},
			rgb2hex : function(rgb) {
				rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			    function hex(x) {
			        return ("0" + parseInt(x).toString(16)).slice(-2);
			    }
			    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
			}
		}		
	};

	var dom = {
			inputQueryUrl : $("#input-stylify"),
			buttonQueryUrl : $("#btn-stylify"),
			homepageImgHolder : $("#homepage-img-holder")
	};

	
	

	stlfy.init = function(){

		dom.buttonQueryUrl.on("click", function(event){
			event.preventDefault();
			var url = $.trim(dom.inputQueryUrl.val()).toLowerCase();
			if(url.indexOf("http://") != 0 && url.indexOf("https://") != 0){
				url = "http://" + url;
			}
			console.log(event, stlfy.util.isUrl(url));
			
			if(stlfy.util.isUrl(url)){
				stlfy.queryUrl(url);
			}else{
				alert("this does not seem to be valid url");
			}
		});
	};

	stlfy.queryUrl = function(url){
		if(url.indexOf("http://") != 0 && url.indexOf("https://") != 0){
			url = "http://" + url;
		}
		$.getJSON("/query?url="+ url, stlfy.renderResult);

	};

	var setColor = function(id, color){
		var holder = $("#color-" + id);
		holder.find(".swatch-holder").css("background", color);
		holder.find(".colour-hex").text(stlfy.util.rgb2hex(color));
	}

	stlfy.renderResult = function(data){
		console.log("renderResult", data);
		setColor(1, data["background-colour"]);
		setColor(2, data["base-text-colour"]);
		setColor(3, data["h2-text-colour"]);	
		setColor(4, data["background-colour"]);
		setColor(5, data["p-text-colour"]);
		setColor(6, data["background-colour"]);

		$("#result-body-dt").find("span:first").text(data["base-font-family"] + ", " + tlfy.util.rgb2hex(data["base-text-colour"]);

		dom.homepageImgHolder.empty().append($("<img />", {"src" : data["thumbPath"]}));
	};

	$(function() {
		stlfy.init();
	});	

})(jQuery);