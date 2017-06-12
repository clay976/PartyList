var hostAcountTools	= require ('../../database/hostTools')

function obtainYearReleased (guestObject){
	return new Promise (function (fulfill, reject){
		hostAcountTools.spotifyApi.getAlbum (guestObject.track.albumID)
		.then (function(album){
			console.log (album.body.release_date)
			guestObject.track.yearReleased = album.body.release_date
			fulfill (guestObject)
		})
	})
}

module.exports {
	obtainYearReleased : obtainYearReleased
}