var twilio       = require('config/twilio')

module.exports = function sendNewGuestWelcomeMessage (requestObject){
	return new Promise (function (fulfill, reject){
		twilio.API.sendMessage(welcomeMessage (requestObject.guestToAdd, requestObject.databaseHost.displayName, requestObject.databaseHost.reqThreshold, requestObject.databaseHost.playlistID))
    .then (function (sentMessage){
      fulfill (requestObject)
    })
    .catch (function (err){
      reject (err)
    })
	})
}

function welcome (hostID, reqThreshold, playlistID){
  return ('You have been added to ' +hostID+ '\'s party with Party List. Send your song requests to this number. Songs will be added after ' +reqThreshold+ 
    '. You can find the playlist here https://play.spotify.com/user/'+hostID+'/playlist/'+ playlistID)
}

function welcomeMessage (toNum, hostID, reqThreshold, playlistID){
  return {
    to    : toNum,
    from  : twilio.from,
    body  : welcome (hostID, reqThreshold, playlistID)
  }
}