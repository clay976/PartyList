//twilio modules
var sid                   = 'AC85573f40ef0c3fb0c5aa58477f61b02e'
var atoken                = 'fcea26b2b0ae541d904ba23e12e2c499'
var twilio                = require('twilio')
var client                = require('twilio/lib')(sid, atoken);

//database modules
var databaseHostTools     = require ('../database/hostTools')
var databaseGuestTools    = require ('../database/guestTools')
var databaseTrackTools    = require ('../database/trackTools')

//spotify modules
var spotifyGuestTools     = require ('../spotify/guest/tools')
var spotifyPlaylistTools  = require ('../spotify/playlist/tools')

//JSON templates
var addResponse           = require ('./responses')

//message incoming
function HandleIncomingMessage (req, res, db){
  var guestNum      = req.body.From
  var guestMessage  = req.body.Body.toLowerCase().trim()
  var resp          = new twilio.TwimlResponse();
  res.writeHead (200, {'Content-Type': 'text/xml'});

  console.log ('validating guest')
  databaseGuestTools.validateGuest (guestNum, guestMessage)
  .then (function (guestObject){
    console.log ('checking for confirmation or for search')
    if ((guestMessage === 'yes') & (guestObject.guest.currentTrack.trackID != '')){ 
      return guestConfirmingCurrentTrack (guestObject)
    }else{
      return searchForNewRequest (guestObject)
    }
  })
  .then (function (response){
    console.log ('sending response')
    resp.message (response)
    res.end(resp.toString())
  })
  .catch (function (rejectMessage){
    console.log ('rejecting')
    console.log (rejectMessage)
    resp.message (rejectMessage)
    res.end(resp.toString())
  })
}

function guestConfirmingCurrentTrack (guestObject){
  return new Promise (function (fulfill, reject){
    console.log ('guest confirming song')
    databaseHostTools.searchDatabaseForHost (guestObject)
    .then (function (guestObject){
      console.log ('searching database for updated requests')
      return databaseTrackTools.searchDatabaseForTrack (guestObject)
    })
    .then (function (guestObject){
      if (guestObject.track.numRequests >= guestObject.host.reqThreshold - 1){
        return confirmTrackandAddToPlaylist (guestObject)
      }else{
        return confirmTrackAndIncrementRequests (guestObject)
      }
    })
    .then (function (response){
      fulfill (response)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}
    
function confirmTrackandAddToPlaylist (guestObject){
  return new Promise (function (fulfill, reject){
    console.log ('adding track to playlist')
    spotifyPlaylistTools.addTracksToPlaylist (guestObject)
    .then (function (guestObject){
      console.log ('added track, updating database')
      return databaseTrackTools.setTrackAddedToPlaylist (guestObject)
    })
    .then (function (guestObject){
      console.log ('clearing guests songs')
      return databaseGuestTools.clearAndAddGuestPreviousRequestInDatabase (guestObject)
    })
    .then (function (guestObject){
      var response = addResponse.songConfirmedAndAdded (guestObject.track.name, guestObject.track.artist)
      fulfill (response)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

function confirmTrackAndIncrementRequests (guestObject){
  return new Promise (function (fulfill, reject){
    console.log ('incrementing songs number of requests')
    databaseGuestTools.incrementSongsRequestsInDatabase (guestObject)
    .then (function (guestObject){
      return (guestObject)
    })
    .then (function (guestObject){
      console.log ('clearing guests songs')
      return databaseGuestTools.clearAndAddGuestPreviousRequestInDatabase (guestObject)
    })
    .then (function (guestObject){
      var response = addResponse.songConfirmed (guestObject.track.name, guestObject.track.artist, guestObject.track.numRequests, guestObject.host.reqThreshold)
      fulfill (response)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

function searchForNewRequest (guestObject){
  return new Promise (function (fulfill, reject){
    console.log ('searching spotify')
    spotifyGuestTools.searchSpotify (guestObject)
    .then (function (guestObject){
      console.log ('checking for prev requests')
      return spotifyGuestTools.checkForPreviousRequests (guestObject)
    })
    .then (function(guestObject){
      console.log ('incremementing or adding to database')
      return databaseTrackTools.incrementOrAddSongInDatabase (guestObject)
    })
    .then (function (guestObject){
      console.log ('updating guests requests')
      return databaseGuestTools.setGuestCurrentTrack (guestObject)
    })
    .then (function (guestObject){
      console.log ('asking to confirm')
      fulfill (addResponse.askToConfirm (guestObject))
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

module.exports = {
  HandleIncomingMessage: HandleIncomingMessage
}
