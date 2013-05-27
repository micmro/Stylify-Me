# Stylify Me

A Style Guide Generator - using [NodeJS](http://nodejs.org/) and [PhantomJS](http://phantomjs.org) a command line webkit browser.
See it live at http://stylifyme.com

This repo only contains the web service.
We host our app on [Heroku](http://heroku.com) using the [multi buildpack](https://github.com/ddollar/heroku-buildpack-multi).


## Running the service locally
1. Make sure you have [NodeJS](http://nodejs.org/) installed and running
2. Download [PhantomJS](http://phantomjs.org) and copy it to *REPOFOLDER/vendor/phantomjs/bin/phantomjs* or update the path in *app.js*
```javaScript
var config = {
	binPath : "vendor/phantomjs/bin/phantomjs"
	....
};
```
3. Update the refere check in "isRefererValid" in "app.js":

```javaScript
isRefererValid : function(referer){
		var validRefs = ["http://stylifyme.com", "http://www.stylifyme.com", "http://stylify.herokuapp.com", "http://localhost:9185", "http://localhost:" + app.get('port')]
			,isvalid = false;
		.....
	}
```
4. start the nodeJs app with *node app.js*
5. query *http://localhost:5000/query?url=http%3A%2F%2Fgoogle.com* (assuming you run your app on port 5000) and you should be able to see a JSON response


### Frontend
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

