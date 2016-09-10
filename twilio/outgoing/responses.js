//node modules

var client = require('twilio/lib')("AC85573f40ef0c3fb0c5aa58477f61b02e", "fcea26b2b0ae541d904ba23e12e2c499");

//my modules
function notGuest (resp){
  resp.message =('\n\nsorry, you are not a guest of a party, you can send back a host code for a party. We have also send the host a text with your number in case they want to add it themselves');
  return resp
}

function emptyConfirmation (resp){
  resp.message =('\n\nWe don\'t have a request for you to confirm or decline. \n\nIf you song is just "yes", or "no", add an artist name to search')
  return resp
}

function trackFound (resp, title, artist, numRequests){
  resp.message = ('\n\n We found: ' +title+ ', by: ' +artist+ 'This Track has ' +numRequests+ ' requests!')
  return resp
}

function declineRequest (resp){
	resp.message = ('\n\nSorry about the wrong song, try modifying your search! Remember to not use any special characters.')
  return resp
}

function songNotFound (resp){
  resp.message = ('\n\nsorry, that song could be found, use as many key words as possible, make sure to not use any special characters either!')
  return resp
}

function advertisment (resp){
  resp.message = ('\n\nYou are recieving an advertisment because you have made 5 successful request')
  return resp
}
/*
function songAdded (toNum, responseBody){
  messageObject = messageTool.message (toNum, responseBody)
  client.sendMessage(messageObject, messageTool.sentHandler)
}

function askConfirmation(res, db, trackAdd){
  var resp = new twilio.TwimlResponse();
  search.search ('tracks', searchTemps.findTrack (trackAdd.tracks.items[0].id), db, function (trackDocFound){
    if (trackDocFound){
      var currentSongRequests = trackDocFound.numRequests
      resp.message = ('track found: ' +trackTitle+ ' by ' +trackArtist+ '\n\n Current number of requests: ' +currentSongRequests+ '\n\nSend back "Yes" to confirm, "No" to discard this request!')
    }else{
      resp.message = ('track found: ' +trackTitle+ ' by ' +trackArtist+ '\n\n This request will be new!! \n\nSend back "Yes" to confirm, "No" to discard this request!')
    }
    res.setHeader('Content-Type', 'text/xml')
    res.send(resp.toString())
  })
}*/


module.exports = {
	notGuest: notGuest,
	emptyConfirmation: emptyConfirmation,
	trackFound: trackFound,
	declineRequest: declineRequest,
	songNotFound: songNotFound,
	advertisment: advertisment
}