var addResponse   = require ('services/twilio/responses')

module.exports = function verifyExplicitFilter (requestObject) {
  return new Promise (function (fulfill, reject){
    for (var index = 0; index < 4; index ++){
      if (!requestObject.databaseHost.explicit && requestObject.tracks[index].explicit){
        requestObject.tracks[index] = addResponse.explicit(requestObject.tracks[index].name, requestObject.tracks[index].artist)
        requestObject.databaseGuest.currentTracks[index] = requestObject.tracks[index]
      }
    }
    fulfill (requestObject)
  })
}