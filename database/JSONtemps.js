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
		'currentTrack'	: { 
		  'trackID'     : '',
		  'name'        : '',
		  'artist'      : ''
		},
		'lastMessage'   : '',
		'prevRequests'  : [],
  	'hostID'				: host,
    'phoneNum'			: number
  }
}

function Track (host, TrackID, name, artist){
	return {
		'hostID'				: host,
	  'trackID'				: TrackID,
	  'name'					: name,
	  'artist'				: artist,
	  'numRequests'		: 0,
	  'timePlayed'		: 0,
	  'foundAmount' 	: 2
	}
}

//$set:{ "playlistID": ID }
//$set: { "currentTrack": trackID }

function guestConfirm(){
  return {
    $inc							: { 
    	numRequests			: -1
    },
    $set							: { 
    	"currentTrack"	: ""
    }
  }
}

//update api info functions
function bothTokens (aToken, rToken){
  var d 		= new Date()
  var time 	= d.getTime()
  return { 
    "access_token"	: aToken,
    "refresh_token"	: rToken,
    "time"					: time
  }
}
function accessToken (aToken){
  var d 	= new Date()
  time 		= d.getTime()
  return {
  	$set							: { 
    	"access_token"	: aToken,
    	"time"					: time
    }
  }
}

module.exports = {
	Host					: Host,
	Guest					: Guest,
	Track					: Track,
	guestConfirm	: guestConfirm,
  bothTokens		: bothTokens,
  accessToken		: accessToken
}