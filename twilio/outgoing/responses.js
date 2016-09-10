//node modules

var client = require('twilio/lib')("AC85573f40ef0c3fb0c5aa58477f61b02e", "fcea26b2b0ae541d904ba23e12e2c499");

//my modules
function notGuest (resp){
  resp.message('\n\nsorry, you are not a guest of a party, you can send back a host code for a party. We have also send the host a text with your number in case they want to add it themselves');
  return resp
}

function emptyConfirmation (resp){
  resp.message('\n\nWe don\'t have a request for you to confirm or decline. \n\nIf you song is just "yes", or "no", add an artist name to search')
  return resp
}

function trackFound (resp, title, artist, numRequests){
  resp.message ('\n\n We found: ' +title+ ', by: ' +artist+ 'This Track has ' +numRequests+ ' requests!')
  return resp
}

function declineRequest (resp){
	resp.message ('\n\nSorry about the wrong song, try modifying your search! Remember to not use any special characters.')
  return resp
}

function songNotFound (resp){
  resp.message ('\n\nsorry, that song could be found, use as many key words as possible, make sure to not use any special characters either!')
  return resp
}

function advertisment (resp){
  resp.message ('\n\nYou are recieving an advertisment because you have made 5 successful request')
  return resp
}

function songConfirmed (resp, title, artist, numRequests){
  resp.message ('\n\n your song: ' +title+ ', by: ' +artist+ 'now has ' +numRequests+ ' requests and will be added to the playlist!')
  return response
}

module.exports = {
	notGuest: notGuest,
	emptyConfirmation: emptyConfirmation,
	trackFound: trackFound,
	declineRequest: declineRequest,
	songNotFound: songNotFound,
	advertisment: advertisment,
  songConfirmed: songConfirmed
}