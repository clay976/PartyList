module.exports = function updateLatestPlaylistInfo (host){
	return new Promise (function (fulfill, reject){
		host.newSpotifyPlaylist = host.playlists[0]
		fulfill (host)
	})
}