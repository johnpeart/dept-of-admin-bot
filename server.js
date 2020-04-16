// Import frameworks from package.json
var 	Twit = require('twit'),
		fs = require('fs'),
		path = require('path')

const 	{ 
	registerFont, 
	createCanvas, 
	Canvas, 
	Image 
} = require('canvas')

// Import modules
config = require(path.join(__dirname, 'config.js'));
quotes = require(path.join(__dirname, 'quotes.js'));
colors = require(path.join(__dirname, 'colors.js'));

// A function to import font files from the /assets/fonts/ folder
function fontFile(name) {
	return path.join(__dirname, '/assets/fonts/', name)
}

// Register the fonts
registerFont(fontFile('Bitter-Regular.ttf'), { family: 'Bitter' })

// A function to split longer quotes over multiple lines, 
// for use as part of the canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = ctx.measureText(testLine);
	  var testWidth = metrics.width;
	  if (testWidth > maxWidth && n > 0) {
	    ctx.fillText(line, x, y);
	    line = words[n] + ' ';
	    y += lineHeight;
	  }
	  else {
	    line = testLine;
	  }
	}
	ctx.fillText(line, x, y);

}

// TWITTER AUTH
// Create a variable that holds the Twitter API credentials
var T = new Twit(config);


// CANVAS VARIABLES
// Pick a quote at random
var chooseQuote 	= quotes[Math.floor(Math.random()*quotes.length)];
// Pick a background colour
var highlightColor	= colors[Math.floor(Math.random()*colors.length)];
// Set sizes of the canvas and its design elements
var twitterPadding = 40;
var twitterWidth = 1200;
var twitterWidthPadding = (twitterWidth - (twitterPadding * 2));
var twitterHeight = 675;
var twitterHeightPadding = (twitterHeight - (twitterPadding * 2));
var twitterLineHeight = 45;
var twitterFontSize = 35;
var twitterBaseline = (twitterHeight * 0.5);
var x = twitterPadding;
var y = twitterPadding;

// Generate a blank canvas canvas
const 	deptcanvas = createCanvas(twitterWidth, twitterHeight)
		deptcanvas instanceof Canvas

// A function to generate the Twitter image via the HTML Canvas API
function createTwitterImage() {

	// Set the width and height of the canvas
	deptcanvas.width = (twitterWidth);
	deptcanvas.height = (twitterHeight);

	// This tells the API that the canvas is 2 dimensional
	var ctx = deptcanvas.getContext('2d');
	ctx.scale(1,1);

	// Creat a full size background fill in white
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, twitterWidth, twitterHeight);

	// Import the external image of the logo
	// Position the logo at the top left of the canvas
	img = new Image()
	img.src = fs.readFileSync(path.join(__dirname, '/assets/', 'logo.png'))
	ctx.drawImage(img, twitterPadding, (twitterPadding * 0.8), img.width / 2, img.height / 2)

	// Create a rectangle and fill it with a the random colour chosen earlier
	// Make the rectangle full width and draw it from underneath the logo to the bottom of the image
	ctx.fillStyle = highlightColor;
	ctx.fillRect(0, ((twitterPadding * 1.6) + (img.height / 2)), twitterWidth, (twitterHeight - ((twitterPadding * 1.6) + (img.height / 2))));

	// Add text
	ctx.textBaseline="top";
	ctx.font = twitterFontSize + "px 'Bitter'";
	ctx.fillStyle = "#ffffff"

	// If the random quote would be wider than the canvas width, break it over multiple lines
	wrapText(ctx, chooseQuote, twitterPadding, ((twitterPadding * 1.6) + (img.height / 2) + twitterPadding), twitterWidthPadding, twitterLineHeight);

}

function sendTweet() {

	// call the function to draw the canvas
	createTwitterImage();

	// Check the character length of the quote, trim it if necessary and insert it in the body of the tweet.
	if ( chooseQuote.length > 270 ) {
		var tweetText = chooseQuote.substring(0,270) + "…";
	} else {
		var tweetText = chooseQuote;
	}

	// Post the tweet
	T.post('media/upload', { media_data: deptcanvas.toBuffer().toString('base64') }, function (err, data, response) {

		// Sets up references to the image and text
		var mediaIdStr = data.media_id_string
		var params = {
			status: tweetText,
			media_ids: [mediaIdStr]
		}

		// Posts the tweet
		T.post('statuses/update', params, function (err, data, response) {
		    console.log(data)
		})

	})

}

sendTweet();
