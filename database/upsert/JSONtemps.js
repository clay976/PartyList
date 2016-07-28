function Host (data, accessToken, refreshToken, homePage){
	var host = {
	  'hostID' 				: data,
	  'access_token'	: accessToken,
	  'expires_in'		: 3600,
	  'refresh_token'	: refreshToken,
	  'playlistID'		: '',
	  'homePage'			: homePage
	}
	return host
}

function Guest (host, number){
	var guest = {
  	'hostID'				: host,
    'phoneNum'			: number,
    'numRequests'		: { type: Number, default: 4 },
    'currentTrack'	: { type: String, default: '' },
    'lastMessage'   : { type: String, default: '' } 
	}
	return guest
}

function Track (TrackID){
	var track = {
  trackId				: TrackID,
  numRequests		: { type: Number, default: 0 },
  timePlayed		: Number 
}
	return track
}

module.exports = {
	Host: Host,
	Guest: Guest,
	Track: Track
}