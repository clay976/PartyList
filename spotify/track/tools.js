var hostAcountTools	= require ('../../database/hostTools')

function obtainYearReleased (guestObject){
	return new Promise (function (fulfill, reject){
		hostAcountTools.spotifyApi.getAlbum (guestObject.track.albumID)
		.then (function(album){
			var date = album.body.release_date.substring(0, 4);
			guestObject.track.yearReleased = date
			fulfill (guestObject)
		})
	})
}

module.exports = {
	obtainYearReleased : obtainYearReleased
}