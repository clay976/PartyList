var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');


function Host (data, accessToken, refreshToken){
	console.log (data)
	console.log (accessToken)
	console.log (refreshToken)
	var host = {
	  hostID 				: String,
	  access_token	: String,
	  expires_in		: Number,
	  refresh_token	: String,
	  playlistID		: String
	}
	return host
}

module.exports = {
	Host: Host
}