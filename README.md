Stylify Me
==========

A Style Guide Generator - using NodeJS (http://nodejs.org/) and PhantomJS (http://phantomjs.org) a command line webkit browser.

We host our app on Heroku (http://heroku.com) using the multi buildpack (https://github.com/ddollar/heroku-buildpack-multi).

See it live at http://stylifyme.com

This repo only contains the web service, you can query it from the front end like this:

```javaScript
var urlToQuery = encodeURIComponent("http://google.com");

$.ajax({
	dataType: "jsonp",
	url: "http://youreServiceUrl.com/query?url="+ urlToQuery,
	success: function(data){
		if(data["error"]){
			alert("Error: " + data["error"]);
			return;
		}
		//PROCESS the result		
	},
	timeout : 10000
}).fail(function(){
	alert("Could not query site, the service might be down, please try again later.");
});
```