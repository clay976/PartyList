//API Wrappers
spotifyApi              = require ('config/SpotifyAPI')

module.exports = function addTrackToSpotifyPlaylist (requestObject){
	return new Promise (function (fulfill, reject){
		spotifyApi.addTracksToPlaylist (requestObject.databaseHost.playlistID, ['spotify:track:'+requestObject.databaseTrack.trackID])
		.then (function (spotifyReesult){
			fulfill (requestObject)
		})
		.catch (function (err){
			reject (err)
		})
	})
}