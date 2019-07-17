var spotifyAPI          = require ('config/SpotifyAPI')
var populateGuestObjectTracks = require ('services/twilio/tools/populateGuestObjectTracks')

// searches spotify for a request. builds an object of 4 popular tracks and responds to guest
module.exports = function searchSpotifyForGuestRequest (requestObject){
  return new Promise (function (fulfill, reject){
    spotifyAPI.searchTracks (requestObject.guestMessage, { limit : 4 })//search spotify for a track based on the message we got from the
    .then (function (spotifyTracks){
      if (spotifyTracks.body.tracks.total != 0){ //we found a track on spotify matching the guest message)
        requestObject.totalTracks = spotifyTracks.body.tracks.total
        var tracks = populateGuestObjectTracks (spotifyTracks)
        requestObject.tracks = tracks
        requestObject.databaseGuest.currentTracks = tracks
        fulfill (requestObject)
      }else{ // we did not find a track matching the guests search request so we reject immediatley and respond to them
        requestObject.databaseGuest.currentTracks = []
        //return databaseGuestTools.clearAndAddPreviousRequest (guestObject)
        reject ('did not find any spotify songs')
      }
    })
    .catch (function (err){
      reject (err)
    })
  })
}