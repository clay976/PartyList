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
	clearGuestSong	: clearGuestSong
}