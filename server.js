var Twit = require('twit'),
	Canvas = require('canvas'),
	fs = require('fs'),
    path = require('path'),
	Image = Canvas.Image;

config = require(path.join(__dirname, 'config.js'));

var T = new Twit(config);

//Generate the canvas
var canvas = new Canvas(1024, 512);
var context = canvas.getContext('2d');


function tweet() {

	//Generate a random colour
	var r = Math.floor((Math.random() * 256));
	var g = Math.floor((Math.random() * 256));
	var b = Math.floor((Math.random() * 256));
	var color = "rgb("+r+","+g+","+b+")";

    // draw box
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, 512);
    context.lineTo(1024, 512);
    context.lineTo(1024, 0);
    context.closePath();
    context.lineWidth = 5;
    context.fillStyle = color;
    context.fill();

    // Uploads the image to Twitter

	T.post('media/upload', { media_data: canvas.toBuffer().toString('base64') }, function (err, data, response) {

		// Sets up references to the image and text
		var mediaIdStr = data.media_id_string
		var params = {
			status: "Test tweet",
			media_ids: [mediaIdStr]
		}

		// Posts the tweet
		T.post('statuses/update', params, function (err, data, response) {
		    console.log(data)
		})

	})

}

tweet();
