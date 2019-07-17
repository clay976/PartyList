//database modules
var searchDatabaseForTrack            = require ('database/track/find')
var updateGuestInDB                   = require ('database/guest/update')
var updateTrackInDB                   = require ('database/track/update')
var addTrackToSpotifyPlaylist         = require ('services/twilio/tools/addTrackToSpotifyPlaylist')
var responses                         = require ('services/twilio/responses')

//message incoming
module.exports = function confirmingCurrentTrack (requestObject){
  return new Promise (function (fulfill, reject){
    if (requestObject.databaseGuest.currentTracks[requestObject.guestMessage - 1].trackID){
      searchDatabaseForTrack (requestObject)
      .then (function (requestObject){
        if (requestObject.databaseTrack.numRequests >= requestObject.databaseHost.reqThreshold - 1){
          requestObject.databaseTrack.addedPlaylist = true
          requestObject.response = responses.songConfirmedAndAdded (requestObject.databaseTrack.name, requestObject.databaseTrack.artist)
          return addTrackToSpotifyPlaylist (requestObject)
        }else{
          requestObject.response = responses.songConfirmed (requestObject.databaseTrack.name, requestObject.databaseTrack.artist, requestObject.databaseTrack.numRequests, requestObject.databaseHost.reqThreshold)
          requestObject.databaseTrack.numRequests = requestObject.databaseTrack.numRequests + 1
          return requestObject
        }
      })
      .then (function (requestObject){
        requestObject.databaseGuest.numRequests = requestObject.databaseGuest.numRequests - 1
        requestObject.databaseGuest.prevRequests.push (requestObject.databaseTrack.trackID)
        requestObject.databaseGuest.currentTracks = []
        return updateGuestInDB (requestObject)
      })
      .then (function (requestObject){
        return updateTrackInDB (requestObject)
      })
      .then (function (response){
        fulfill (response)
      })
      .catch (function (err){
        reject (err)
      })
    }else{
      reject (requestObject.databaseGuest.currentTracks[requestObject.guestMessage - 1])
    }
  })
}