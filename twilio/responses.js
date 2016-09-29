//node modules

var client = require('twilio/lib')("AC85573f40ef0c3fb0c5aa58477f61b02e", "fcea26b2b0ae541d904ba23e12e2c499");

//my modules
var notGuest = ('sorry, we could not find a party that you are currently a guest of. Send the host\'s phone number in the format "1234567890" and we will ask them to add you');

var emptyConfirmation = ('We don\'t have a request for you to confirm or decline. \n\nIf your song is just "yes", or "no", add an artist name to search')

function trackFound (resp, title, artist){
  return new Promise (function (fulfill, reject){
    model.Track.findOne({ 'trackID' : guestReqObject.guest.currentTack.id}).exec()
    .then (function (trackFound){
      if (trackFound){
        fulfill ('\n\n We found: ' +title+ ', by: ' +artist+ '. This Track has ' +trackFound.numRequests+ ' requests!')
      }else{
        fulfill ('\n\n We found: ' +title+ ', by: ' +artist+ '. This Track has 0 requests!')
      }
    })
    .catch (function (err){
      reject ('database '+err)
    })
  })
}

function declineRequest (resp){
  return ('\n\nSorry about the wrong song, try modifying your search! Remember to not use any special characters.')
}

function songNotFound (resp){
  return ('\n\nsorry, that song could be found, use as many key words as possible, make sure to not use any special characters either!')
}

function songConfirmedAndadvertisment (title, artist, numRequests){
  return ('\n\n your song: ' +title+ ', by: ' +artist+ 'now has ' +numRequests+ ' requests and will be added to the playlist!\n\nYou are also recieving an advertisment because you have made 5 successful request')
}

function songConfirmed (resp, title, artist, numRequests){
  return ('\n\n your song: ' +title+ ', by: ' +artist+ 'now has ' +numRequests+ ' requests and will be added to the playlist!')
}

module.exports = {
  notGuest: notGuest,
  emptyConfirmation: emptyConfirmation,
  trackFound: trackFound,
  declineRequest: declineRequest,
  songNotFound: songNotFound,
  songConfirmedAndadvertisment: songConfirmedAndadvertisment,
  songConfirmed: songConfirmed
}