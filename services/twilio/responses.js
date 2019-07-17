//my modules
var notGuest      = ('Sorry, we could not find a party that you are currently a guest of. Send the host\'s phone number in the format "1234567890" and we will ask them to add you.');

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

function alreadyAdded (title, artist){
  return (title+ ', by: ' +artist+ '. Already added to playlist.')
}

function alreadyRequested (title, artist){
  return (title+ ', by: ' +artist+ '. You already requested this Track.')
}

function askToConfirm (name, artist, numRequests){
  return (name+ ', by: ' +artist+ ', ' +numRequests+ ' request(s)!')
}

function explicit (title, artist){
  return (title+ ', by: ' +artist+ '. Cannot be added, it is explicit')
}

function yearFilter (title, artist, min, year, max){
  return (title+ ', by: ' +artist+ '. Cannot be added. released in ' +year+ '. Must be released between ' +min+ ' and ' +max+ '.')
}

module.exports = {
  errorMessage                          : errorMessage,
  notGuest                              : notGuest,
  songNotFound                          : songNotFound,
  songConfirmedAndadvertisment          : songConfirmedAndadvertisment,
  songConfirmed                         : songConfirmed,
  songConfirmedAndAdded                 : songConfirmedAndAdded,
  songConfirmedAndAddedAndadvertisment  : songConfirmedAndAddedAndadvertisment,
  alreadyAdded                          : alreadyAdded,
  alreadyRequested                      : alreadyRequested,
  askToConfirm                          : askToConfirm,
  explicit                              : explicit,
  yearFilter                            : yearFilter
}