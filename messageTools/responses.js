//node modules
var twilioAccountSID = "AC85573f40ef0c3fb0c5aa58477f61b02e";
var twilioAccountSecret = "fcea26b2b0ae541d904ba23e12e2c499";
var twilio = require('twilio')

//my modules
var messageTool = require ('./message')
var query = require ('../databasetools/querydb')

function notGuest (res){
  var resp = new twilio.TwimlResponse();

  resp.message('\n\nsorry, you are not a guest of a party, you can send back a host code for a party. We have also send the host a text with your number in case they want to add it themselves');
  resp.writeHead(200, {'Content-Type': 'text/xml'});
  res.send(resp.toString());
}

function emptyConfirmation (res){
  var resp = new twilio.TwimlResponse();

  resp.message('\n\nWe don\'t have a request for you to confirm or decline. \n\nIf you song is just "yes", or "no", add an artist name to search')
  resp.writeHead(200, {'Content-Type': 'text/xml'});
  res.send(resp.toString());
}

function requestedAlready (res, reqsLeft, trackRequests){
  var resp = new twilio.TwimlResponse();

  var responseBody = ('\n\nThis track has already been requested, Your request will bump it up in the queue!\n\n Requests before next ad: ' +reqsLeft+ '\n\n This song now has ' +(trackRequests + 1)+ ' requests!')
  resp.writeHead(200, {'Content-Type': 'text/xml'});
  res.send(resp.toString());
}

function newRequest (res, reqsLeft){
  var resp = new twilio.TwimlResponse();

  resp.message = ('\n\nThis track is new!! \n\n Requests before next ad: ' +reqsLeft+ '\n\n This song now has 1 request!')
  resp.writeHead(200, {'Content-Type': 'text/xml'});
  res.send(resp.toString());
}

function declineRequest (res){
  var resp = new twilio.TwimlResponse();

	resp.message = ('\n\nSorry about the wrong song, try modifying your search! Remember to not use any special characters.')
  resp.writeHead(200, {'Content-Type': 'text/xml'});
  res.send(resp.toString());
}

function songNotFound (res){
  var resp = new twilio.TwimlResponse();

  resp.message = ('\n\nsorry, that song could be found, use as many key words as possible, make sure to not use any special characters either!')
  resp.writeHead(200, {'Content-Type': 'text/xml'});
  res.send(resp.toString());
}

function advertisment (res){


	var responseBody = ('\n\nYou are recieving an advertisment because you have made 5 successful request')
	twilio.Message(responseBody, messageTool.sentHandler)
}

function askConfirmation(res, db, trackAdd){
  var resp = new twilio.TwimlResponse();
	var trackID =trackAdd.tracks.items[0].id
	var trackTitle = trackAdd.tracks.items[0].name
	var trackArtist = trackAdd.tracks.items[0].artists[0].name
	var trackObjID = query.findTrack (trackID)

  query.search ('tracks', trackObjID, db, function (trackDocFound){
    if (trackDocFound){
      var currentSongRequests = trackDocFound.numRequests
      resp.message = ('track found: ' +trackTitle+ ' by ' +trackArtist+ '\n\n Current number of requests: ' +currentSongRequests+ '\n\nSend back "Yes" to confirm, "No" to discard this request!')
    }else{
      resp.message = ('track found: ' +trackTitle+ ' by ' +trackArtist+ '\n\n This request will be new!! \n\nSend back "Yes" to confirm, "No" to discard this request!')
    }
    resp.writeHead(200, {'Content-Type': 'text/xml'});
    res.send(resp.toString());
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