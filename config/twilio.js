//Twilio
const dotenv 			= require ('dotenv');

//app definitions
dotenv.config();

var twilio         	= require('twilio')
var twilioClient    = require('twilio/lib')(process.env.TWILIO_ID, process.env.TWILIO_TOKEN);

module.exports = {
	services: twilio,
	API		: twilioClient,
	from	: process.env.TWILIO_FROM
}