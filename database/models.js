var mongoose      = require("mongoose");
mongoose.Promise  = require('bluebird');
//db.guests.remove( { phoneNum : '+16134539030' } )

var guest = mongoose.Schema({
	hostID				: String,
  phoneNum			: Number,
  currentTracks : [],
  numRequests		: { type: Number, default: 4 },
  lastMessage   : { type: String, default: '' },
  prevRequests  : [String]
})

var track = mongoose.Schema({
  hostID        : String,
  trackID				: String,
  name          : String,
  artist        : String,
  numRequests		: { type: Number, default: 0 },
  timePlayed		: Number,
  addedPlaylist : { type: Boolean, defauult: false},
  foundAmount   : { type: Number, default: 0 },
  explicit      : Boolean,
  yearReleased  : Number
})

var host = mongoose.Schema({
  hostID 				: String,
  displayName   : String,
  access_token	: String,
  expires_in		: { type: Number, default: 3600 },
  timeSet       : Number,
  refresh_token	: String,
  playlistID		: { type: String, default: '' },
  playlistName  : { type: String, default: '' },
  homePage      : String,
  explicit      : { type: Boolean, default: true},
  minYear       : Number,
  maxYear       : Number,
  reqThreshold  : { type: Number, default: 2} 
})

var Guest = mongoose.model('Guest', guest);
var Track = mongoose.model('Track', track);
var Host  = mongoose.model('Host', host);

module.exports = {
  Guest : Guest,
  Track : Track,
  Host  : Host
}