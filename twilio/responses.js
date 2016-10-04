//node modules
var model = require ('../database/models')

//my modules
var notGuest = ('sorry, we could not find a party that you are currently a guest of. Send the host\'s phone number in the format "1234567890" and we will ask them to add you');

var emptyConfirmation = ('We don\'t have a request for you to confirm or decline. If your song is just "yes", or "no", add an artist name to search')

var declineRequest = ('Sorry about the wrong song, try modifying your search! Remember to not use any special characters.')

var songNotFound = ('sorry, that song could be found, use as many key words as possible, make sure to not use any special characters either!')

function trackFoundOnSpotify (trackID, title, artist){
  return new Promise (function (fulfill, reject){
    model.Track.findOne({ 'trackID' : trackID}).exec()
    .then (function (trackFound){
      if (trackFound){
        fulfill ('We found: ' +title+ ', by: ' +artist+ '. This Track has ' +trackFound.numRequests+ ' requests! \n\n Send back "yes" to confirm or search another song to discard this request')
      }else{
        fulfill ('We found: ' +title+ ', by: ' +artist+ '. This Track has 0 requests! \n\n Send back "yes" to confirm or search another song to discard this request')
      }
    })
    .catch (function (err){
      reject ('database '+err)
    })
  })
}

function songConfirmedAndadvertisment (title, artist, numRequests){
  return ('your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' requests! You are also recieving an advertisment because you have made 5 successful request')
}

function songConfirmed (title, artist, numRequests){
  return ('your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' requests!')
}

function songConfirmedAndAdded (title, artist, numRequests){
  return ('your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' requests and will be added to the playlist!')
}

function songConfirmedAndAddedAndadvertisment (title, artist, numRequests){
  return ('your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' requests and will be added to the playlist!')
}

module.exports = {
  notGuest: notGuest,
  emptyConfirmation: emptyConfirmation,
  trackFoundOnSpotify: trackFoundOnSpotify,
  declineRequest: declineRequest,
  songNotFound: songNotFound,
  songConfirmedAndadvertisment: songConfirmedAndadvertisment,
  songConfirmed: songConfirmed,
  songConfirmedAndAdded: songConfirmedAndAdded,
  songConfirmedAndAddedAndadvertisment: songConfirmedAndAddedAndadvertisment
}