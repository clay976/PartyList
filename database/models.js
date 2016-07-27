var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require("mongoose"))


var guest = mongoose.Schema({
	hostID				: String,
  phoneNum			: String,
  numRequests		: Number,
  currentTrack	: String 
})

var track = mongoose.Schema({
  trackId				: String,
  numRequests		: Number,
  timePlayed		: Number 
})

var host = mongoose.Schema({
  hostID 				: String,
  access_token	: String,
  expires_in		: Number,
  refresh_token	: String,
  playlistID		: String
})

var Guest = mongoose.model('Guest', guest);
var Track = mongoose.model('Track', track);
var Host = mongoose.model('Host', host);

module.exports = {
  Guest: Guest,
  Track: Track,
  Host: Host
}