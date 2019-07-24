module.exports = function populateGuestObjectTracks (spotifyTracks){
	var arr = []
	var limit = 3
	for (var index = 0; index <= limit; index ++){
		console.log (spotifyTracks.body.tracks.items[index].name)
		arr[index] = {
	    'trackID'     : spotifyTracks.body.tracks.items[index].id,
	    'name'        : spotifyTracks.body.tracks.items[index].name,
	    'artist'      : spotifyTracks.body.tracks.items[index].artists[0].name,
	    'albumID'     : spotifyTracks.body.tracks.items[index].album.id,
	    'numRequests' : 0,
	    'explicit'    : spotifyTracks.body.tracks.items[index].explicit,
	    'yearReleased': null
  	}
	}
	return arr
}