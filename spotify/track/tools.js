var hostAcountTools	= require ('../../database/hostTools')

function obtainYearReleased (guestObject){
	return new Promise (function (fulfill, reject){
		var y1 = hostAcountTools.spotifyApi.getAlbum (guestObject.tracks[0].albumID)
		var y2 = hostAcountTools.spotifyApi.getAlbum (guestObject.tracks[1].albumID)
		var y3 = hostAcountTools.spotifyApi.getAlbum (guestObject.tracks[2].albumID)
		var y4 = hostAcountTools.spotifyApi.getAlbum (guestObject.tracks[3].albumID)

		Promise.all([y1, y2, y3, y4]).then(function (values){
			guestObject.tracks[0].yearReleased = values[0].body.release_date.substring(0, 4)
			guestObject.tracks[1].yearReleased = values[1].body.release_date.substring(0, 4)
			guestObject.tracks[2].yearReleased = values[2].body.release_date.substring(0, 4)
			guestObject.tracks[3].yearReleased = values[3].body.release_date.substring(0, 4)
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