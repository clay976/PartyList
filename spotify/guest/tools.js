var databaseHostTools   = require ('../../database/hostTools')
var databaseGuestTools  = require ('../../database/guestTools')
var addResponse         = require ('../../twilio/responses')
var JSONtemp            = require ('./JSONtemps')

function searchSpotify (guestObject){
  var query = guestObject.guest.lastMessage
  return new Promise (function (fulfill, reject){
    var error = 'error searching spotify for song, please try again'
    databaseHostTools.spotifyApi.setAccessToken(guestObject.host.access_token)
    databaseHostTools.spotifyApi.searchTracks (query, { limit : 4 })//search spotify for a track based on the message we got from the
    .then (function (spotifyTrack){
      console.log ('number of items found on Spotify :' +spotifyTrack.body.tracks.total)
      if (spotifyTrack.body.tracks.total != 0){ //we found a track on spotify matching the guest message)
        guestObject.totalTracks = spotifyTrack.body.tracks.total
        guestObject.tracks = JSONtemp.populateGuestObjectTracks (spotifyTrack)
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
    for (var index = 0; index < 4; index ++){
      if (guestObject.tracks[index].addedPlaylist){
        guestObject.tracks[index] = addResponse.alreadyAdded (guestObject.tracks[index].name, guestObject.tracks[index].artist)
      }else{
        for (var i = 0; i < guestObject.guest.prevRequests.length; i++){
          if (guestObject.tracks[index].trackID === guestObject.guest.prevRequests[i]){
            //we found that the guest has already requested the same track they searched so reject with that message right away
            guestObject.tracks[index] = addResponse.alreadyRequested (guestObject.tracks[index].name, guestObject.tracks[index].artist)
          }
        }
      }
    }
    fulfill (guestObject)
  })
}

module.exports = {
  searchSpotify             : searchSpotify,
  checkForPreviousRequests  : checkForPreviousRequests
}