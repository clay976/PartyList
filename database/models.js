var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');


var guest = mongoose.Schema({
	hostID				: String,
  phoneNum			: String,
  numRequests		: Number,
  currentTrack	: { type: String, default: '' },
  lastMessage   : { type: String, default: '' } 
})

var track = mongoose.Schema({
  trackId				: String,
  numRequests		: { type: Number, default: 0 },
  timePlayed		: Number 
})

var host = mongoose.Schema({
  hostID 				: String,
  access_token	: String,
  expires_in		: { type: Number, default: 3600 },
  refresh_token	: String,
  playlistID		: { type: String, default: '' },
  homePage      : String
})

var Guest = mongoose.model('Guest', guest);
var Track = mongoose.model('Track', track);
var Host = mongoose.model('Host', host);

module.exports = {
  Guest: Guest,
  Track: Track,
  Host: Host
}