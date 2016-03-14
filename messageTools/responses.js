//node modules
var twilio = require('twilio')

//my modules
var messageTool = require ('./message')
var query = require ('../databasetools/querydb')

function notGuest (toNum){
	var responseBody = ('sorry, you are not a guest of a party, you can send back a host code for a party. We have also send the host a text with your number in case they want to add it themselves')
	messageObject = messageTool.message (toNum, responseBody)
	twilio.sendMessage(messageObject, messageTool.sentHandler)
}

function emptyConfirmation (toNum){
  var responseBody = ('\n\nWe don\'t have a request for you to confirm or decline. \n\nIf you song is just "yes", or "no", add an artist name to search')
  messageObject = messageTool.message (toNum, responseBody)
  twilio.sendMessage(messageObject, messageTool.sentHandler)
}

function requestedAlready (toNum, reqsLeft, trackRequests){
  var responseBody = ('\n\nThis track has already been requested, Your request will bump it up in the queue!\n\n Requests before next ad: ' +reqsLeft+ '\n\n This song now has ' +trackRequests+ ' requests!')
  messageObject = messageTool.message (toNum, responseBody)
  twilio.sendMessage(messageObject, messageTool.sentHandler)
}

function newRequest (toNum, reqsLeft){
  var responseBody = ('\n\nThis track is new!! \n\n Requests before next ad: ' +reqsLeft+ '\n\n This song now has 1 request!')
  messageObject = messageTool.message (toNum, responseBody)
  twilio.sendMessage(messageObject, messageTool.sentHandler)
}

function declineRequest (toNum){
	var responseBody = ('\n\nSorry about the wrong song, try modifying your search! Remember to not use any special characters.')
	messageObject = messageTool.message (sender, responseBody)
	twilio.sendMessage(messageObject, messageTool.sentHandler)
}

function songNotFound (toNum){
  var responseBody = ('sorry, that song could be found, use as many key words as possible, make sure to not use any special characters either!')
  messageObject = messageTool.message (sender, responseBody)
  twilio.sendMessage(messageObject, messageTool.sentHandler)
}

function advertisment (toNum){
	var responseBody = ('\n\nYou are recieving an advertisment because you have made 5 successful request')
	messageObject = messageTool.message (sender, responseBody)
	twilio.sendMessage(messageObject, messageTool.sentHandler)
}

function askConfirmation(db, toNum, trackAdd){
	var trackID =trackAdd.tracks.items[0].id
	var trackTitle = trackAdd.tracks.items[0].name
	var trackArtist = trackAdd.tracks.items[0].artists[0].name
	var trackObjID = query.findTrack (trackID)

  query.search ('tracks', trackObjID, db, function (trackDocFound){
    if (trackDocFound){
      var currentSongRequests = trackDocFound.numRequests
      responseBody = ('track found: ' +trackTitle+ ' by ' +trackArtist+ '\n\n Current number of requests: ' +currentSongRequests+ '\n\nSend back "Yes" to confirm, "No" to discard this request!')
    }else{
      responseBody = ('track found: ' +trackTitle+ ' by ' +trackArtist+ '\n\n This request is new!! \n\nSend back "Yes" to confirm, "No" to discard this request!')
    }
    messageObject = messageTool.message (toNum, responseBody)
    console.log (responseBody)
    twilio.sendMessage(messageObject, messageTool.sentHandler)
  })
}



module.exports = {
	notGuest: notGuest,
	emptyConfirmation: emptyConfirmation,
	requestedAlready: requestedAlready,
	newRequest: newRequest,
	declineRequest: declineRequest,
	songNotFound: songNotFound,
	advertisment: advertisment,
  askConfirmation: askConfirmation
}