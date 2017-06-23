var hostAcountTools	= require ('../../database/hostTools')

function obtainYearReleased (guestObject){
	return new Promise (function (fulfill, reject){
		for (var index = 0; index < 4; index ++){
			hostAcountTools.spotifyApi.getAlbum (guestObject.tracks[index].albumID)
			.then (function(album){
				var date = album.body.release_date.substring(0, 4);
				guestObject.tracks[index].yearReleased = date
			})
			.catch (function (err){
				reject (err)
			})
		}
		guestObject.tracks[3].yearReleased.then (fulfill (guestObject))
	})
}

module.exports = {
	obtainYearReleased : obtainYearReleased
}