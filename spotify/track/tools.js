var hostAcountTools	= require ('../../database/hostTools')

function obtainYearReleased (guestObject){
	return new Promise (function (fulfill, reject){
		hostAcountTools.spotifyApi.getAlbum (guestObject.track.albumID)
		.then (function(album){
			var date = album.body.release_date.substring(0, 3);
			console.log (date)
			guestObject.track.yearReleased = date
			fulfill (guestObject)
		})
	})
}

module.exports = {
	obtainYearReleased : obtainYearReleased
}