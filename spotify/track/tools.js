var hostAcountTools	= require ('../../database/hostTools')

function obtainYearReleased (guestObject){
	return new Promise (function (fulfill, reject){
		guestObject.tracks[0].yearReleased = hostAcountTools.spotifyApi.getAlbum (guestObject.tracks[0].albumID)
		guestObject.tracks[1].yearReleased = hostAcountTools.spotifyApi.getAlbum (guestObject.tracks[1].albumID)
		guestObject.tracks[2].yearReleased = hostAcountTools.spotifyApi.getAlbum (guestObject.tracks[2].albumID)
		hostAcountTools.spotifyApi.getAlbum (guestObject.tracks[3].albumID)
		.then (function(album){
			var date = album.body.release_date.substring(0, 4);
			guestObject.tracks[3].yearReleased = date
			fulfill (guestObject)
		})
		.catch (function (err){
			reject (err)
		})
	})
}

module.exports = {
	obtainYearReleased : obtainYearReleased
}