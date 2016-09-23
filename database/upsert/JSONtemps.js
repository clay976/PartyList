function Host (data, accessToken, refreshToken, homePage){
	var host = {
	  'hostID' 				: data,
	  'access_token'	: accessToken,
	  'expires_in'		: 3600,
	  'refresh_token'	: refreshToken,
	  'playlistID'		: '',
	  'homePage'			: homePage,
	  'exlpicit'			: true
	}
	return host
}

function Guest (host, number){
	var guest = {
  	'hostID'				: host,
    'phoneNum'			: number
	}
	return guest
}

function Track (TrackID){
	var track = {
  'trackID'				: TrackID,
  'numRequests'		: 0,
  'timePlayed'		: 0 
}
	return track
}

module.exports = {
	Host: Host,
	Guest: Guest,
	Track: Track
}