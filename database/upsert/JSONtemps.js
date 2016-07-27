var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');


function Host (data){
	console.log (data)
	var host = mongoose.Schema({
	  hostID 				: String,
	  access_token	: String,
	  expires_in		: Number,
	  refresh_token	: String,
	  playlistID		: String
	})
	return host
}

module.exports = {
	Host: Host
}