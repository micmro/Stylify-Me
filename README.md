# Stylify Me

A Style Guide Generator - using [NodeJS](http://nodejs.org/) and [Puppeteer](https://pptr.dev/), an API to control Chrome.
See it live at http://stylifyme.com

This repo only contains the web service.

## Deployment

We host our app on EC2

Example installation steps on an Ubuntu image:

```bash
# install chromium
sudo apt-get update
sudo apt-get install -y libappindicator1 fonts-liberation
sudo apt-get install -y chromium-browser

# install node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

#install puppeteer
sudo apt-get install -y gcc g++ make
sudo npm install -g puppeteer

# download and unzip repo
wget https://github.com/micmro/Stylify-Me/archive/main.tar.gz
tar -xzvf ./main.tar.gz
rm main.tar.gz
mv Stylify-Me-main stylifyme
cd stylifyme/

#install dependencies and start on port 80
npm ci
sudo PORT=80 npm run start
```

## Running the service locally

1. Make sure you have [NodeJS](http://nodejs.org/) installed and running
2. Install dependencies with npm `npm install`
3. Update the referrer urls in [`/src/config.mjs`](https://github.com/micmro/Stylify-Me/blob/master/src/config.mjs#L8-L14) with the urls of your frontend (local and production):
4. Start the nodeJs app with `npm run start` (or `node app.mjs`)
5. Query [`http://localhost:5000/query?url=https%3A%2F%2Fgoogle.com`](http://localhost:5000/query?url=https%3A%2F%2Fgoogle.com) (assuming you run your app on port `5000`) and you should be able to see a JSON response
   _I recommend using [Postman](http://www.getpostman.com) for debugging your api_

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
