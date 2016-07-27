function Host (data, accessToken, refreshToken){
	var host = {
	  'hostID' 				: data,
	  'access_token'	: accessToken,
	  'expires_in'		: 3600,
	  'refresh_token'	: refreshToken,
	  'playlistID'		: ''
	}
	return host
}

module.exports = {
	Host: Host
}