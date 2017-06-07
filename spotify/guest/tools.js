var databaseHostTools = require ('../../database/hostTools')
var databaseGuestTools = require ('../../database/guestTools')
var addResponse     = require ('../../twilio/responses')

function searchSpotify (guestObject){
  var query = guestObject.guest.lastMessage

  return new Promise (function (fulfill, reject){
    var error = 'error searching spotify for song, please try again'
    databaseHostTools.spotifyApi.searchTracks (query, { limit : 1 })//search spotify for a track based on the message we got from the
    .then (function (spotifyTrack){
      if (spotifyTrack.body.tracks.total != 0){ //we found a track on spotify matching the guest message)
        guestObject.track = {
          'trackID'     : spotifyTrack.body.tracks.items[0].id,
          'name'        : spotifyTrack.body.tracks.items[0].name,
          'artist'      : spotifyTrack.body.tracks.items[0].artists[0].name,
          'numRequests' : 0,
          'explicit'    : spotifyTrack.body.tracks.items[0].explicit
        }
        fulfill (guestObject)
      }else{ // we did not find a track matching the guests search request so we reject immediatley and respond to them
        guestObject.guest.currentTrack.trackID = null
        return databaseGuestTools.clearAndAddPreviousRequest (guestObject)
        .then (reject (addResponse.songNotFound))
        .catch (reject (error))
      }
    })
    .catch (function (err){
      reject (err)
    })
  })
}

function checkForPreviousRequests (guestObject){
  return new Promise (function (fulfill, reject){
    if (guestObject.track.addedPlaylist){
      reject (addResponse.alreadyAdded (guestObject.track.name, guestObject.track.artist))
    }else{
      for (var i = 0; i < guestObject.guest.prevRequests.length; i++){
        if (guestObject.track.trackID === guestObject.guest.prevRequests[i]){
          //we found that the guest has already requested the same track they searched so reject with that message right away
          reject (addResponse.alreadyRequested (guestObject.track.name, guestObject.track.artist))
        }
      }
      //this is a new request from this guest so continue on the function chain
      fulfill (guestObject)
    }
  })
}

module.exports = {
  searchSpotify             : searchSpotify,
  checkForPreviousRequests  : checkForPreviousRequests
}