"use strict";

(function($){

	window.stlfy = {
		util : {
			isUrl : function(url){ 
				return url.match(/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi);
			},
			rgb2hex : function(rgb) {
				if(!rgb || rgb.indexOf("rgb") != 0){
					return rgb|| "-";
				}
				var rgbArr = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

				if(!rgbArr){
					rgbArr = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/);
				}
			    function hex(x) {
			        return ("0" + parseInt(x).toString(16)).slice(-2);
			    }
			    return "#" + hex(rgbArr[1]) + hex(rgbArr[2]) + hex(rgbArr[3]);
			}
		}		
	};

	var dom = {
			body : $(document.body),
			inputQueryUrl : $("#input-stylify"),
			buttonQueryUrl : $("#btn-stylify"),
			formQueryUrl : $("#form-stylify"),
			homepageImgHolder : $("#homepage-img-holder"),
			loaderOverlay : $("#loadingOverlay")
	};

	var isQuerying = false;
	var currQueryUrl = "";
	

	stlfy.init = function(){

		dom.formQueryUrl.on("submit", function(event){
			event.preventDefault();
			currQueryUrl = dom.inputQueryUrl.val();
			_gaq.push(['_trackEvent', 'home', 'search', currQueryUrl]);
			if(isQuerying){
				_gaq.push(['_trackEvent', 'home', 'search-still-querying', currQueryUrl]);
				return
			}
			

			var url = $.trim(currQueryUrl).toLowerCase();
			if(url.indexOf("http://") != 0 && url.indexOf("https://") != 0){
				url = "http://" + url;
			}
			
			if(stlfy.util.isUrl(url)){
				
				stlfy.queryUrl(url);
			}else{
				_gaq.push(['_trackEvent', 'home', 'invalid-search', currQueryUrl]);
				alert("this does not seem to be valid url");
			}
		});
	};

	stlfy.setQueryInProgressState = function(){
		isQuerying = true;
		dom.body.addClass("loading");
		dom.loaderOverlay.fadeIn();
	};

	stlfy.setQueryDoneState = function(){
		isQuerying = false;
		dom.body.removeClass("loading");
		dom.loaderOverlay.fadeOut();
	}

	stlfy.queryUrl = function(url){
		stlfy.setQueryInProgressState();
		$.getJSON("/query?url="+ url, stlfy.renderResult);
	};

	var setColor = function(id, color){
		var holder = $("#color-" + id);
		holder.find(".swatch-holder").css("background", color);
		holder.find(".colour-hex").text(stlfy.util.rgb2hex(color));
	};

	var setStyle = function(el, data, dataBase){
		//data["h1-font"] + ", " + data["h1-font-style"] + ", " + data["h1-font-size"] + ", " + data["h1-leading"] + ", " + stlfy.util.rgb2hex(data["h1-text-colour"]
		$(el).css({
			"font-family" : data[dataBase + "-font"]
			,"font-style" : data[dataBase + "-font-style"]
			,"font-size" : data[dataBase + "-font-size"]
			,"line-height" : data[dataBase + "-leading"]
			,"color" : data[dataBase + "-text-colour"]
		});
	}

	stlfy.renderResult = function(data){
		setColor(1, data["background-colour"]);
		setColor(2, data["base-text-colour"]);
		setColor(3, data["h1-text-colour"]);	
		setColor(4, data["h2-text-colour"]);
		setColor(5, data["p-text-colour"]);
		setColor(6, data["a-text-colour"]);

		$("#result-body-dt").find("span:first").text(data["base-font"] + ", " + data["base-font-style"] + ", " + data["base-font-size"]  + ", " + data["base-leading"]   + ", " + stlfy.util.rgb2hex(data["base-text-colour"]));

		$("#result-header-1-dt").find("span:first").text(data["h1-font"] + ", " + data["h1-font-style"] + ", " + data["h1-font-size"] + ", " + data["h1-leading"] + ", " + stlfy.util.rgb2hex(data["h1-text-colour"]));
		$("#result-header-2-dt").find("span:first").text(data["h2-font"] + ", " + data["h2-font-style"] + ", " + data["h2-font-size"] + ", " + data["h2-leading"] + ", " + stlfy.util.rgb2hex(data["h2-text-colour"]));
		$("#result-header-3-dt").find("span:first").text(data["h3-font"] + ", " + data["h3-font-style"] + ", " + data["h3-font-size"] + ", " + data["h3-leading"] + ", " + stlfy.util.rgb2hex(data["h3-text-colour"]));
		$("#result-header-4-dt").find("span:first").text(data["h4-font"] + ", " + data["h4-font-style"] + ", " + data["h4-font-size"] + ", " + data["h4-leading"] + ", " + stlfy.util.rgb2hex(data["h4-text-colour"]));
		$("#result-header-5-dt").find("span:first").text(data["h5-font"] + ", " + data["h5-font-style"] + ", " + data["h5-font-size"] + ", " + data["h5-leading"] + ", " + stlfy.util.rgb2hex(data["h5-text-colour"]));
		$("#result-header-6-dt").find("span:first").text(data["h6-font"] + ", " + data["h6-font-style"] + ", " + data["h6-font-size"] + ", " + data["h6-leading"] + ", " + stlfy.util.rgb2hex(data["h6-text-colour"]));

		setStyle($("#result-header-1-dd"), data, "h1");
		setStyle($("#result-header-2-dd"), data, "h2");
		setStyle($("#result-header-3-dd"), data, "h3");
		setStyle($("#result-header-4-dd"), data, "h4");
		setStyle($("#result-header-5-dd"), data, "h5");
		setStyle($("#result-header-6-dd"), data, "h6");
		setStyle($("#result-body-dt"), data, "base");

		$("#result-links-dd").css({"color":data["a-text-colour"]})

		$.each(data["img-paths"], function(i, el){
			$("#image-holder-" + (i+1)).find("img").attr("src", el);
		});
		


		dom.homepageImgHolder.empty().append($("<img />", {"src" : data["thumbPath"]}));
		_gaq.push(['_trackEvent', 'home', 'search-retrieved', currQueryUrl]);
		stlfy.setQueryDoneState();
	};

	$(function() {
		stlfy.init();
	});	

})(jQuery);