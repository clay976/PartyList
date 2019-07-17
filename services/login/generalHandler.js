var querystring             = require('querystring')
var SpotifyScope			= require ('config/spotifyScope')

module.exports = function generalHandler (req, res){
	res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify(SpotifyScope))
}