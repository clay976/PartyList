//node modules
var model = require ('../database/models')

//my modules
var notGuest = ('Sorry, we could not find a party that you are currently a guest of. Send the host\'s phone number in the format "1234567890" and we will ask them to add you. \n\n if you are trying to join the HOCO playlist send back "add me please"');

var emptyConfirmation = ('We don\'t have a request for you to confirm or decline. If your song is just "yes", or "no", add an artist name to search')

var declineRequest = ('Sorry about the wrong song, try modifying your search! Remember to not use any special characters.')

var songNotFound = ('Sorry, that song could be found, use as many key words as possible, make sure to not use any special characters either!')

function trackFoundOnSpotify (hostID, trackID, title, artist, prevReqs){
  return new Promise (function (fulfill, reject){
    var trackFound = model.Track.findOne({$and: [{ 'trackID' : trackID}, {'hostID' : hostID}]}).exec()
    var prevRequests = checkForPreviousRequests (trackID, prevReqs)
    
    Promise.all ([trackFound, prevRequests])
    .then (function (values){ 
      trackFound = values[0]
      prevRequests = values[1]
      if (trackFound && trackFound.addedPaylist){
        reject ('We found: ' +title+ ', by: ' +artist+ '. This Track has ' +(trackFound.numRequests + 1)+ ' request(s) and has already been added to the playlist.')
      }else if (trackFound && prevRequests) {
        reject ('We found: ' +title+ ', by: ' +artist+ '. You have already requested this Track. Ask someone else to request it and get it on the playlist!!')
      }else if (trackFound){
        fulfill ('We found: ' +title+ ', by: ' +artist+ '. This Track has ' +trackFound.numRequests+ ' request(s)! \n\n Send back "yes" to confirm or search another song to discard this request.')
      }else{
        fulfill ('We found: ' +title+ ', by: ' +artist+ '. This Track has 0 requests! \n\n Send back "yes" to confirm or search another song to discard this request.')
      }
    })
    .catch (function (err){
      reject (err)
    })
  })
}

function checkForPreviousRequests (trackID, prevRequests){
  return new Promise (function (fulfill, reject){
    for (var i = 0; i < prevRequests.length; i++){
      if (trackID === prevRequests[i]){
        fulfill (true)
      }
    }
    fulfill (false)
  })
}

function songConfirmedAndadvertisment (title, artist, numRequests){
  return ('Your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' request(s)! You are also recieving an advertisment because you have made 5 successful request')
}

function songConfirmed (title, artist, numRequests){
  return ('Your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' request(s)!')
}

function songConfirmedAndAdded (title, artist, numRequests){
  return ('Your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' requests and will be added to the playlist!')
}

function songConfirmedAndAddedAndadvertisment (title, artist, numRequests){
  return ('Your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' requests and will be added to the playlist!')
}

function errorOnOurEnd (){
  return ('We are very sorry there was an error on our end. Please try again!')
}

function welcome (hostID, reqThreshold, playlistID){
  return ('you have been added to ' +hostID+ '\'s party with Party List. Send your song requests to this number. Songs will be added after ' +reqThreshold+ '. You can find the playlist here https://play.spotify.com/user/clay976/playlist/'+ playlistID)
}

module.exports = {
  notGuest                              : notGuest,
  emptyConfirmation                     : emptyConfirmation,
  trackFoundOnSpotify                   : trackFoundOnSpotify,
  declineRequest                        : declineRequest,
  songNotFound                          : songNotFound,
  songConfirmedAndadvertisment          : songConfirmedAndadvertisment,
  songConfirmed                         : songConfirmed,
  songConfirmedAndAdded                 : songConfirmedAndAdded,
  songConfirmedAndAddedAndadvertisment  : songConfirmedAndAddedAndadvertisment,
  errorOnOurEnd                         : errorOnOurEnd,
  welcome                               : welcome
}