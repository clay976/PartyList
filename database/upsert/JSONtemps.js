var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');


function Host (data, accessToken, refreshToken){
	var host = {
	  hostID 				: data.body.id,
	  access_token	: accessToken,
	  expires_in		: 3600,
	  refresh_token	: refreshToken,
	  playlistID		: ''
	}
	return host
}

module.exports = {
	Host: Host
}