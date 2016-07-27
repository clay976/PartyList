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

module.exports = {
	Host: Host
}