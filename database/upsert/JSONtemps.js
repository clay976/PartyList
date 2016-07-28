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

function Track (TrackID){
	var track = {
  trackId				: TrackID,
  numRequests		: { type: Number, default: 0 },
  timePlayed		: Number 
}
	return track
}

module.exports = {
	Host: Host
}