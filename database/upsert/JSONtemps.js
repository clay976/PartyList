function Host (data, accessToken, refreshToken, homePage){
	return {
	  'hostID' 				: data,
	  'access_token'	: accessToken,
	  'expires_in'		: 3600,
	  'refresh_token'	: refreshToken,
	  'homePage'			: homePage,
	  'exlpicit'			: true
	}
}

function Guest (host, number){
	return {
  	'hostID'				: host,
    'phoneNum'			: number
  }
}

function Track (host, TrackID, name, artist){
	return {
		'hostID'				: host
	  'trackID'				: TrackID,
	  'name'					: name,
	  'artist'				: artist,
	  'numRequests'		: 0,
	  'timePlayed'		: 0,
	  'foundAmount' 	: 2
	}
}

module.exports = {
	Host: Host,
	Guest: Guest,
	Track: Track
}