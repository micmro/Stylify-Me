# Stylify Me

A Style Guide Generator - using [NodeJS](http://nodejs.org/) and [PhantomJS](http://phantomjs.org), a command line webkit browser.
See it live at http://stylifyme.com

This repo only contains the web service.
We host our app on [Heroku](http://heroku.com) using the [multi buildpack](https://github.com/ddollar/heroku-buildpack-multi).


## Running the service locally
1. Make sure you have [NodeJS](http://nodejs.org/) installed and running
2. Install dependencies with npm `npm install`
3. Update the referer url check in  "app.js" with the url of your frontend (local and production):

	```javaScript
	isRefererValid : function(referer){
			var validRefs = ["http://stylifyme.com", "http://www.stylifyme.com", "http://stylify.herokuapp.com", "http://localhost:9185", "http://localhost:" + app.get('port')]
				,isvalid = false;
			.....
		}
	```
4. Start the nodeJs app with `node app.js`
5. Query *http://localhost:5000/query?url=https%3A%2F%2Fgoogle.com* (assuming you run your app on port 5000) and you should be able to see a JSON response
	I recomend using [Postman](http://www.getpostman.com) for debugging your api


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

