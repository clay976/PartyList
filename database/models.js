var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
//db.guests.remove( { phoneNum : '+16134539030' } )

var guest = mongoose.Schema({
	hostID				: String,
  phoneNum			: String,
  numRequests		: { type: Number, default: 4 },
  currentTrack	: { 
    trackID     : { type: String, default: '' },
    name        : { type: String, default: '' },
    artist      : { type: String, default: '' }
  },
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
  addedPaylist  : { type: Boolean, defauult: false},
  foundAmount   : { type: Number, default: 0 }
})

var host = mongoose.Schema({
  hostID 				: String,
  access_token	: String,
  expires_in		: { type: Number, default: 3600 },
  refresh_token	: String,
  playlistID		: { type: String, default: '' },
  playlistName  : { type: String, default: '' },
  homePage      : String,
  explicit      : { type: Boolean, defauult: true}
})

var Guest = mongoose.model('Guest', guest);
var Track = mongoose.model('Track', track);
var Host  = mongoose.model('Host', host);

module.exports = {
  Guest: Guest,
  Track: Track,
  Host: Host
}