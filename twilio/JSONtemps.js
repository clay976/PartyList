
function guest (databaseObject){
	return {
		"guest"					: databaseObject,
		"trackFound"		: null,
		"response"			: null,
		"guestUpdate"		: null,
		"trackUpdate"		: null,
		"spotifySearch"	: false
	}
}
function clearGuestSong (num, trackID){
	return 	{
		$inc						: {
			numRequests		: num
		}, 
		$set						: { 
			currentTrack 	: {
		  	trackID 		: '', 
		  	name    		: '', 
		  	artist  		: ''
		  }
		},
		$push						: {
			prevRequests	: trackID
		}
	}
}

module.exports = {
	clearGuestSong	: clearGuestSong,
	guest						: guest
}