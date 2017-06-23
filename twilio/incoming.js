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
var spotifyTrackTools     = require ('../spotify/track/tools')

//JSON templates
var addResponse           = require ('./responses')

//message incoming
function HandleIncomingMessage (req, res, db){
  var guestNum      = req.body.From
  var guestMessage  = req.body.Body.toLowerCase().trim()
  var resp          = new twilio.TwimlResponse();
  res.writeHead (200, {'Content-Type': 'text/xml'});

  databaseGuestTools.validateGuest (guestNum, guestMessage)
  .then (function (guestObject){
    return databaseHostTools.searchDatabaseForHost (guestObject)
  })
  .then (function (guestObject){
    if ((guestMessage === 'yes') & (guestObject.guest.currentTrack.trackID != '')){ 
      return guestConfirmingCurrentTrack (guestObject)
    }else{
      return searchForNewRequest (guestObject)
    }
  })
  .then (function (response){
    resp.message (response)
    res.end(resp.toString())
  })
  .catch (function (rejectMessage){
    if (rejectMessage.stack){
      console.log (rejectMessage.stack)
      resp.message (addResponse.errorMessage)
      res.end(resp.toString())
    }else{
      console.log (rejectMessage)
      resp.message (rejectMessage)
      res.end(resp.toString())
    }
  })
}

function guestConfirmingCurrentTrack (guestObject){
  return new Promise (function (fulfill, reject){
    databaseTrackTools.searchDatabaseForTrack (guestObject)
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
      reject (err)
    })
  })
}
    
function confirmTrackandAddToPlaylist (guestObject){
  return new Promise (function (fulfill, reject){
    spotifyPlaylistTools.addTracksToPlaylist (guestObject)
    .then (function (guestObject){
      return databaseTrackTools.setTrackAddedToPlaylist (guestObject)
    })
    .then (function (guestObject){
      return databaseGuestTools.clearAndAddPreviousRequest (guestObject)
    })
    .then (function (guestObject){
      fulfill (addResponse.songConfirmedAndAdded (guestObject.track.name, guestObject.track.artist))
    })
    .catch (function (err){
      reject (err)
    })
  })
}

function confirmTrackAndIncrementRequests (guestObject){
  return new Promise (function (fulfill, reject){
    databaseTrackTools.incrementSongsRequestsInDatabase (guestObject)
    .then (function (guestObject){
      return (guestObject)
    })
    .then (function (guestObject){
      return databaseGuestTools.clearAndAddPreviousRequest (guestObject)
    })
    .then (function (guestObject){
      fulfill (addResponse.songConfirmed (guestObject.track.name, guestObject.track.artist, guestObject.track.numRequests, guestObject.host.reqThreshold))
    })
    .catch (function (err){
      reject (err)
    })
  })
}

function searchForNewRequest (guestObject){
  return new Promise (function (fulfill, reject){
    spotifyGuestTools.searchSpotify (guestObject)
    .then (function (guestObject){
      return spotifyTrackTools.obtainYearReleased (guestObject)
    })
    .then (function(guestObject){
      return databaseTrackTools.incrementOrAddSongInDatabase (guestObject)
    })
    .then (function (guestObject){
      console.log (guestObject.tracks)
      return databaseHostTools.verifyExplicitFilter (guestObject)
    })
    .then (function (guestObject){
      return databaseHostTools.verifyYearFilter (guestObject)
    })
    .then (function (guestObject){
      return spotifyGuestTools.checkForPreviousRequests (guestObject)
    })
    .then (function (guestObject){
      return databaseGuestTools.setCurrentTrack (guestObject)
    })
    .then (function (guestObject){
      fulfill (addResponse.askToConfirm (guestObject))
    })
    .catch (function (err){
      reject (err)
    })
  })
}

module.exports = {
  HandleIncomingMessage: HandleIncomingMessage
}
