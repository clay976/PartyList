//node modules
var querystring       = require ('querystring')

module.exports = function setNewPlaylistHomePage (host){
	host.databaseHost.homePage 		= '/loggedIn.html#' +querystring.stringify({'hostID':host.spotifyID, 'playlistID': host.newSpotifyPlaylist.id})
	host.databaseHost.playlistID 	= host.newSpotifyPlaylist.id
	host.databaseHost.playlistName 	= host.newSpotifyPlaylist.name
	return host
}

