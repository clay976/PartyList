function Host (data, accessToken, refreshToken, homePage, playID, playName){
	return {
	  'hostID' 				: data,
	  'access_token'	: accessToken,
	  'expires_in'		: 3600,
	  'refresh_token'	: refreshToken,
	  'homePage'			: homePage,
	  'exlpicit'			: true,
    'playlistID'    : playID,
    'playName'      : playName
	}
}

function Guest (host, number){
	return {
		'currentTracks'	: [],
		'lastMessage'   : '',
		'prevRequests'  : [],
  	'hostID'				: host,
    'phoneNum'			: number
  }
}

function Track (host, TrackID, name, artist, exp, year){
	return {
		'hostID'				: host,
	  'trackID'				: TrackID,
	  'name'					: name,
	  'artist'				: artist,
	  'numRequests'		: 0,
	  'timePlayed'		: 0,
    'addedPlaylist' : false,
	  'foundAmount' 	: 1,
    'explicit'      : exp,
    'yearReleased'  : year
	}
}

function guestConfirm(){
  return {
    $inc             : { 
    	numRequests    : -1
    },
    $set						 : { 
    	"currentTrack" : ""
    }
  }
}

function setGuestTrack (tracks){
	return	{
    trackID     : id, 
    name        : name, 
    artist      : artist,
    numRequests : numRequests
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

function spotifyGuest (databaseObject){
  return {
    "guest" : databaseObject,
    "tracks" : null,
    "host"  : null
  }
}

function clearGuestTrack (num, trackID){
  return  {
    $inc            : {
      numRequests   : num
    }, 
    $set            : { 
      currentTracks : []
    },
    $push           : {
      prevRequests  : trackID
    }
  }
}

module.exports = {
	Host					  : Host,
	Guest				    : Guest,
	Track				    : Track,
	guestConfirm	  : guestConfirm,
	setGuestTrack   : setGuestTrack,
  bothTokens		  : bothTokens,
  accessToken	    : accessToken,
  spotifyGuest    : spotifyGuest,
  clearGuestTrack : clearGuestTrack
}