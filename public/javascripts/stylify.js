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
			    if(rgbArr && rgbArr[4] && rgbArr[4] == "0"){
			    	return "transparent";
			    }
			    return "#" + hex(rgbArr[1]) + hex(rgbArr[2]) + hex(rgbArr[3]);
			},
			formatUrl : function(url){
				url = $.trim(url).toLowerCase();
				if(url.indexOf("http://") != 0 && url.indexOf("https://") != 0){
					url = "http://" + url;
				}
				return url;
			}
		}		
	};

	var dom = {
			body : $(document.body),
			inputQueryUrl : $("#input-stylify"),
			buttonQueryUrl : $("#btn-stylify"),
			buttonPrint : $("#btn-print"),
			buttonDownload : $("#btn-download"),			
			formQueryUrl : $("#form-stylify"),
			homepageImgHolder : $("#homepage-img-holder"),
			loaderOverlay : $("#loadingOverlay"),
			backToTopLink : $("#link-back-to-top")
	};

	var isQuerying = false;
	var currQueryUrl = "";
	

	stlfy.init = function(){

		dom.inputQueryUrl.on("blur keypress", function(event){			
			if(event.type != "keypress" || event.which == 13){
				if(dom.inputQueryUrl.val().indexOf("://") == -1 && dom.inputQueryUrl.val() != ""){
					dom.inputQueryUrl.val("http://" + dom.inputQueryUrl.val());
				}
			}
		});

		dom.formQueryUrl.on("submit", function(event){
			event.preventDefault();
			currQueryUrl = stlfy.util.formatUrl(dom.inputQueryUrl.val());
			_gaq.push(['_trackEvent', 'home', 'search', currQueryUrl]);
			if(isQuerying){
				_gaq.push(['_trackEvent', 'home', 'search-still-querying', currQueryUrl]);
				return
			}
			
			if(stlfy.util.isUrl(url)){
				dom.inputQueryUrl.blur();
				dom.buttonQueryUrl.blur();
				stlfy.queryUrl(url);
			}else{
				_gaq.push(['_trackEvent', 'home', 'invalid-search', currQueryUrl]);
				alert("this does not seem to be valid url");
			}
		});

		dom.backToTopLink.on("click", function(event) {
			event.preventDefault();
			$("html, body").animate({ scrollTop: 0 }, "slow");
		});

		
		dom.buttonDownload.on("click", function(){
			_gaq.push(['_trackEvent', 'home', 'download-clicked', currQueryUrl]);
			alert("Sorry, this feature is not implmented yet.");
		});

		dom.buttonPrint.on("click", function(){
			_gaq.push(['_trackEvent', 'home', 'print-clicked', currQueryUrl]);
			window.print();
		});

		$(window).on('scroll', function(){
			if(document.body.scrollHeight > $(document.body).height()){
				dom.backToTopLink.show();
			}else{
				dom.backToTopLink.hide();
			}
		}).trigger("scroll");

		

	};

	stlfy.setQueryInProgressState = function(){
		isQuerying = true;
		dom.body.addClass("loading");
		dom.loaderOverlay.fadeIn();
	};

	stlfy.setQueryDoneState = function(){
		isQuerying = false;
		dom.body.removeClass("loading").addClass("resultShown");
		dom.loaderOverlay.fadeOut();
		dom.buttonQueryUrl.blur();
	}

	stlfy.queryUrl = function(url){
		stlfy.setQueryInProgressState();
		$.getJSON("/query?url="+ url, stlfy.renderResult).error(function(){		
			_gaq.push(['_trackEvent', 'home', 'search-error', currQueryUrl]);
			console.error(arguments);
			alert("Could not query site, please try again.");
			stlfy.setQueryDoneStat();
		});
	};

	var setColour = function(id, colour){
		var holder = $("#color-" + id);
		if(colour && colour != "N/A"){
			holder.fadeIn();
			holder.find(".swatch-holder").css("background", colour);
			holder.find(".colour-hex").text(colour);
		}else{
			holder.fadeOut();
		}
	};

	var setStyle = function(elText, elStyle, data, dataBase){
		elText.find("span:first").text(data[dataBase + "-font"] + ", " + data[dataBase + "-font-style"] + ", " + data[dataBase + "-font-size"] + ", " + data[dataBase + "-leading"] + ", " + stlfy.util.rgb2hex(data[dataBase + "-text-colour"]));
		elText.children().fadeTo(200, (data[dataBase + "-font"] == "N/A") ? "0.2" : "1");
		elStyle.children().fadeTo(200, (data[dataBase + "-font"] == "N/A") ? "0.2" : "1");
		elStyle.children().css({
			"font-family" : data[dataBase + "-font"]
			,"font-style" : data[dataBase + "-font-style"]
			,"font-size" : data[dataBase + "-font-size"]
			,"line-height" : data[dataBase + "-leading"]
			,"color" : data[dataBase + "-text-colour"]
		});
	}

	stlfy.renderResult = function(data){
		var colours = [data["background-colour"], data["main-background-colour"], data["base-text-colour"]];
		var coloursUnique = [], tempColour;
		var allColours = (data["colours"]||[]).sort(function SortByName(a, b){
		  return ((b[1] < a[1]) ? -1 : ((b[1] > a[1]) ? 1 : 0));
		});
		$.each(colours, function(i, el){
			tempColour = stlfy.util.rgb2hex(el);
		    if($.inArray(tempColour, coloursUnique) === -1 && tempColour != "transparent"){
		    	coloursUnique.push(tempColour);
		    }
		});

		$.each(allColours, function(key, val){
			tempColour = stlfy.util.rgb2hex(val[0]);
			if($.inArray(tempColour, coloursUnique) === -1 && tempColour != "transparent"){				
		    	coloursUnique.push(tempColour);
		    }			
		});
		
		for(var i = 0; i < 8; i++){
			setColour(i+1, coloursUnique[i]);
		}

		setStyle($("#result-header-1-dt"), $("#result-header-1-dd"), data, "h1");
		setStyle($("#result-header-2-dt"), $("#result-header-2-dd"), data, "h2");
		setStyle($("#result-header-3-dt"), $("#result-header-3-dd"), data, "h3");
		setStyle($("#result-header-4-dt"), $("#result-header-4-dd"), data, "h4");
		setStyle($("#result-header-5-dt"), $("#result-header-5-dd"), data, "h5");
		setStyle($("#result-header-6-dt"), $("#result-header-6-dd"), data, "h6");
		setStyle($("#result-body-dt"), $("#result-body-dd, #result-links-dd"), data, "base");

		$("#result-links-dd").css({"color":data["a-text-colour"]})

		$("image-holder").hide();

		$.each(data["img-paths"], function(i, el){
			var imgHolder = $("#image-holder-" + (i+1));
			imgHolder.children("img").on("load",function(){
				$(this).off("load").css("width", "auto").fadeIn();
				imgHolder.children("span").text(this.naturalWidth + " x " + this.naturalHeight + " px");
			}).attr("src", el);
			
		});		

		dom.homepageImgHolder.empty().append($("<img />", {"src" : data["thumbPath"]}));
		_gaq.push(['_trackEvent', 'home', 'search-retrieved', currQueryUrl]);
		stlfy.setQueryDoneState();
	};

	$(function() {
		stlfy.init();
	});	

})(jQuery);