
function populateGuestObjectTracks (spotifyTracks){
	var arr = []
	var limit
	if (spotifyTracks.body.tracks.total > 3){
		limit = 3
	}else if (spotifyTracks.body.tracks.total >2){
		limit = 2
	}else if (spotifyTracks.body.tracks.total >1){
		limit = 1
	}else if (spotifyTracks.body.tracks.total >0){
		limit = 0
	}

	for (var index = 0; index <= limit; index ++){
		console.log ('____________________________TRACK______________________________')
		console.log (spotifyTracks.body.tracks.items[index])
		arr[index] = {
	    'trackID'     : spotifyTracks.body.tracks.items[index].id,
	    'name'        : spotifyTracks.body.tracks.items[index].name,
	    'artist'      : spotifyTracks.body.tracks.items[index].artists[0].name,
	    'albumID'     : spotifyTracks.body.tracks.items[index].album.id,
	    'numRequests' : 0,
	    'explicit'    : spotifyTracks.body.tracks.items[index].explicit
  	}
	}
	console.log (arr)
	return arr
}

module.exports = {
	populateGuestObjectTracks : populateGuestObjectTracks
}