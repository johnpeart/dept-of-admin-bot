var 	Twit = require('twit'),
		fs = require('fs'),
		path = require('path')

const 	{ registerFont, createCanvas, Canvas, Image } = require('canvas')

config = require(path.join(__dirname, 'config.js'));
quotes = require(path.join(__dirname, 'quotes.js'));
colors = require(path.join(__dirname, 'colors.js'));

function fontFile (name) {
	return path.join(__dirname, '/assets/fonts/', name)
}

// Pass each font, including all of its individual variants if there are any, to
// `registerFont`. When you set `ctx.font`, refer to the styles and the family
// name as it is embedded in the TTF. If you aren't sure, open the font in
// FontForge and visit Element -> Font Information and copy the Family Name
registerFont(fontFile('Bitter-Regular.ttf'), { family: 'Bitter' })

var T = new Twit(config);

//Generate the canvas
const deptcanvas = createCanvas(1024, 512)
deptcanvas instanceof Canvas

var chooseQuote 	= quotes[Math.floor(Math.random()*quotes.length)];
var highlightColor	= colors[Math.floor(Math.random()*colors.length)];


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

function tweet() {

	var twitterPadding = 45;
	var twitterWidth = 1200;
	var twitterWidthPadding = (twitterWidth - (twitterPadding * 2));
	var twitterHeight = 675;
	var twitterHeightPadding = (twitterHeight - (twitterPadding * 2));
	var twitterLineHeight = 50;
	var twitterFontSize = 40;

	var twitterBaseline = (twitterHeight * 0.5);

	deptcanvas.width = (twitterWidth * 2);
	deptcanvas.height = (twitterHeight * 2);

	var x = twitterPadding;
	var y = twitterPadding;

	var ctx = deptcanvas.getContext('2d');
	ctx.scale(2,2);

	var text = chooseQuote;

	// Background fill with white

	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, twitterWidth, twitterHeight);

	// Draw the logo at the top of the image

	img = new Image()
	img.src = fs.readFileSync(path.join(__dirname, '/assets/', 'logo.png'))
	ctx.drawImage(img, twitterPadding, (twitterPadding * 0.8), img.width / 2, img.height / 2)

	ctx.fillStyle = highlightColor;
	ctx.fillRect(0, ((twitterPadding * 2) + (img.height / 2)), twitterWidth, (twitterHeight - ((twitterPadding * 2) + (img.height / 2))));

	// Add text
	ctx.textBaseline="top";
	ctx.font = twitterFontSize + "px 'Bitter'";
	ctx.fillStyle = "#ffffff"

	wrapText(ctx, text, twitterPadding, (twitterPadding * 4), twitterWidthPadding, twitterLineHeight);


	// take the text shown on the image, and also insert it in the body of the tweet.
	if ( text.length > 270 ) {
		var tweetText = text.substring(0,270) + "…";
	} else {
		var tweetText = text;
	}



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

tweet();
