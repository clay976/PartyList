//node modules
const dotenv 			= require ('dotenv');
var SpotifyWebApi 		= require ('spotify-web-api-node');

//app definitions
dotenv.config();

//Spotify
var spotifyUserScope  = 'user-read-private user-read-email user-read-birthdate streaming playlist-modify-private playlist-modify-public playlist-read-private'
var spotifyRedirectURI

if (process.env.NODE_ENV == 'DEV'){
	spotifyRedirectURI = "http://localhost/login/callback"
}else if (process.env.NODE_ENV == 'PROD'){
	spotifyRedirectURI = "http://criwcomputing.com/login/callback"
}else{

}

module.exports = {
	response_type     : 'code',
	client_id         : process.env.SPOTIFY_ID,
	scope             : spotifyUserScope,
	redirect_uri      : spotifyRedirectURI
}