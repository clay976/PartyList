var searchSpotifyForGuestRequest    = require ('services/twilio/tools/searchSpotifyForGuestRequest')
var obtainYearReleased              = require ('services/twilio/tools/obtainYearReleased')
var checkForPreviousRequests        = require ('services/twilio/tools/checkForPreviousRequests')
var finalizeTrackRequestInformation = require ('services/twilio/tools/finalizeTrackRequestInformation')

var updateGuestInDB                 = require ('database/guest/update')
var incrementOrAddSongInDatabase    = require ('database/track/incrementOrAdd')
var verifyExplicitFilter            = require ('database/host/tools/verifyExplicitFilter')
var verifyYearFilter                = require ('database/host/tools/verifyYearFilter')


module.exports = function searchForNewRequest (requestObject){
  return new Promise (function (fulfill, reject){
    searchSpotifyForGuestRequest (requestObject)
    .then (function (requestObject){
      return obtainYearReleased (requestObject)
    })
    .then (function(requestObject){
      return incrementOrAddSongInDatabase (requestObject)
    })
    .then (function (requestObject){
      return verifyExplicitFilter (requestObject)
    })
    .then (function (requestObject){
      return verifyYearFilter (requestObject)
    })
    .then (function (requestObject){
      return checkForPreviousRequests (requestObject)
    })
    .then (function (requestObject){
      return finalizeTrackRequestInformation (requestObject)
    })
    .then (function (requestObject){
      return updateGuestInDB (requestObject)
    })
    .then (function (requestObject){
      fulfill (requestObject)
    })
    .catch (function (err){
      reject (err)
    })
  })
}