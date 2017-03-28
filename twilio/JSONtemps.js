
function guest (databaseObject){
	return {
		"guest"					: databaseObject,
		"spotifyTrack"	: null,
		"databaseTrack"	: null,
		"response"			: null,
		"guestUpdate"		: null,
		"trackUpdate"		: null,
		"state"					: ''
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