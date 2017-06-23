//my modules
var notGuest      = ('Sorry, we could not find a party that you are currently a guest of. Send the host\'s phone number in the format "1234567890" and we will ask them to add you. \n\n if you are trying to join the HOCO playlist send back "add me please"');

var songNotFound  = ('Sorry, that song could be found, use as many key words as possible, make sure to not use any special characters either!')

var errorMessage  = ('There was an error on our end. We are very sorry, please try again!')

function songConfirmedAndadvertisment (title, artist, numRequests){
  return ('Your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' request(s)! You are also recieving an advertisment because you have made 5 successful request')
}

function songConfirmed (title, artist, numRequests, reqThreshold){
  return ('Your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' request(s)! Songs need ' +reqThreshold+ ' to be added to the playlist.')
}

function songConfirmedAndAdded (title, artist){
  return ('Your song: ' +title+ ', by: ' +artist+ ' has enough requests and will be added to the playlist!')
}

function songConfirmedAndAddedAndadvertisment (title, artist, numRequests){
  return ('Your song: ' +title+ ', by: ' +artist+ ' now has ' +(numRequests+1)+ ' requests and will be added to the playlist!')
}

function welcome (hostID, reqThreshold, playlistID){
  return ('You have been added to ' +hostID+ '\'s party with Party List. Send your song requests to this number. Songs will be added after ' +reqThreshold+ '. You can find the playlist here https://play.spotify.com/user/clay976/playlist/'+ playlistID)
}

function alreadyAdded (title, artist){
  return ('We found: ' +title+ ', by: ' +artist+ '. This Track has already been added to the playlist. Search for a new one!')
}

function alreadyRequested (title, artist){
  return ('We found: ' +title+ ', by: ' +artist+ '. You have already requested this Track. Ask someone else to request it and get it on the playlist!!')
}

function askToConfirm (name, artist, numRequests){
  return ('We found: ' +name+ ', by: ' +artist+ '. This Track has ' +numRequests+ ' request(s)! \n\n Send back "yes" to confirm or search another song to discard this request.')
}

function explicit (title, artist){
  return ('We found: ' +title+ ', by: ' +artist+ '. This track cannot be added to the playlist as it is explicit and the host does not allow that')
}

function yearFilter (title, artist, min, year, max){
  return ('We found: ' +title+ ', by: ' +artist+ '. This track cannot be added to the playlist as it is was released in ' +year+ '. Tracks must have been released between ' +min+ ' and ' +max+ '.')
}

module.exports = {
  errorMessage                          : errorMessage,
  notGuest                              : notGuest,
  songNotFound                          : songNotFound,
  songConfirmedAndadvertisment          : songConfirmedAndadvertisment,
  songConfirmed                         : songConfirmed,
  songConfirmedAndAdded                 : songConfirmedAndAdded,
  songConfirmedAndAddedAndadvertisment  : songConfirmedAndAddedAndadvertisment,
  welcome                               : welcome,
  alreadyAdded                          : alreadyAdded,
  alreadyRequested                      : alreadyRequested,
  askToConfirm                          : askToConfirm,
  explicit                              : explicit,
  yearFilter                            : yearFilter
}