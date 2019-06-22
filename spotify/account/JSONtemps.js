var SpotifyWebApi = require('spotify-web-api-node');
var credentials 	= {
  clientId		: 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret	: '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri	: 'http://criwcomputing.com/callback'
}
var spotifyApi 		= new SpotifyWebApi(credentials);


//Application information
var scope         = 'user-read-private user-read-email user-read-birthdate streaming playlist-modify-private playlist-modify-public playlist-read-private'
var client_id     = 'a000adffbd26453fbef24e8c1ff69c3b'
var client_secret = '899b3ec7d52b4baabba05d6031663ba2'
var redirect_uri  = 'http://criwcomputing.com/callback'

function buildScope (){
  return {
    response_type     : 'code',
    client_id         : client_id,
    scope             : scope,
    redirect_uri      : redirect_uri
  }
}

module.exports = {
  buildScope          : buildScope
}