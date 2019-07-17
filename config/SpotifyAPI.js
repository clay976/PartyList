//node modules
const dotenv 			= require ('dotenv');
var SpotifyWebApi 		= require ('spotify-web-api-node');

//app definitions
dotenv.config();

//Spotify
var Spotifycredentials  = {
  	clientId		: process.env.SPOTIFY_ID,
  	clientSecret	: process.env.SPOTIFY_SECRET,
  	redirectUri		: process.env.SPOTIFY_REDIRECT
}

const spotifyAPI = new SpotifyWebApi(Spotifycredentials);

module.exports = spotifyAPI
