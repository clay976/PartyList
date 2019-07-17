//app modules
var addResponse         = require ('services/twilio/responses')

module.exports = function checkForPreviousRequests (requestObject){
  return new Promise (function (fulfill, reject){
    for (var index = 0; index < 4; index ++){
      if (requestObject.tracks[index].addedPlaylist){
        requestObject.tracks[index] = addResponse.alreadyAdded (requestObject.tracks[index].name, requestObject.tracks[index].artist)
      }else{
        for (var i = 0; i < requestObject.databaseGuest.prevRequests.length; i++){
          if (requestObject.tracks[index].trackID === requestObject.databaseGuest.prevRequests[i]){
            //we found that the guest has already requested the same track they searched so reject with that message right away
            requestObject.tracks[index] = addResponse.alreadyRequested (requestObject.tracks[index].name, requestObject.tracks[index].artist)
            requestObject.databaseGuest.currentTracks[index] = requestObject.tracks[index]
          }
        }
      }
    }
    fulfill (requestObject)
  })
}