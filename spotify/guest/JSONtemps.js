
function populateGuestObjectTracks (spotifyTracks){
	var arr = [] 	
	var limit = spotifyTracks.body.tracks.total
	for (var index = 0; index < limit; index ++){
		arr[index] = {
	    'trackID'     : spotifyTracks.body.tracks.items[index].id,
	    'name'        : spotifyTracks.body.tracks.items[index].name,
	    'artist'      : spotifyTracks.body.tracks.items[index].artists[0].name,
	    'albumID'     : spotifyTracks.body.tracks.items[index].album.id,
	    'numRequests' : 0,
	    'explicit'    : spotifyTracks.body.tracks.items[index].explicit
  	}
	}
	return arr
}

module.exports = {
	populateGuestObjectTracks : populateGuestObjectTracks
}