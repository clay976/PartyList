//node modules

//app modules
var spotifyAPI          = require ('config/SpotifyAPI')

module.exports = function obtainYearReleased (requestObject){
	return new Promise (function (fulfill, reject){
		var y1 = spotifyAPI.getAlbum (requestObject.tracks[0].albumID)
		var y2 = spotifyAPI.getAlbum (requestObject.tracks[1].albumID)
		var y3 = spotifyAPI.getAlbum (requestObject.tracks[2].albumID)
		var y4 = spotifyAPI.getAlbum (requestObject.tracks[3].albumID)

		Promise.all([y1, y2, y3, y4]).then(function (values){
			requestObject.tracks[0].yearReleased = values[0].body.release_date.substring(0, 4)
			requestObject.tracks[1].yearReleased = values[1].body.release_date.substring(0, 4)
			requestObject.tracks[2].yearReleased = values[2].body.release_date.substring(0, 4)
			requestObject.tracks[3].yearReleased = values[3].body.release_date.substring(0, 4)
			fulfill (requestObject)
		})
		.catch (function (err){
			reject (err)
		})
	})
}