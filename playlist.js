
var client_id = 'a000adffbd26453fbef24e8c1ff69c3b'; // Your client id
var client_secret = '899b3ec7d52b4baabba05d6031663ba2'; // Your client secret
var redirect_uri = 'http://37bcdf6b.ngrok.io/callback'; 
var fs = require('fs')
var SpotifyWebApi = require("spotify-web-api-node");
var spotifyApi = new SpotifyWebApi({
  clientId : client_id,
  clientSecret : client_secret,
  redirectUri : redirect_uri
  });  

module.exports.addTack = function (userName, songID){
  // Add tracks to the playlist
  spotifyApi.addTracksToPlaylist(userName, playlistId, songID);
};
