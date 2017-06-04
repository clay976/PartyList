//twilio modules
var twilio          = require('twilio')
var sid             = 'AC85573f40ef0c3fb0c5aa58477f61b02e'
var atoken          = 'fcea26b2b0ae541d904ba23e12e2c499'
var client          = require('twilio/lib')(sid, atoken);

//database modules
var hostAcountTools = require ('../database/hostTools')
var guestTools      = require ('../database/guestTools')
var model           = require ('../database/models')
var JSONtemplate    = require ('../database/JSONtemps')

//other templates
var addResponse     = require ('./responses')
var guestObj        = require ('./JSONtemps')

/*
var dataBaseTrack   = model.Track.findOne({$and: [{ 'trackID' : guestReqObject.guest.currentTrack.trackID}, {'hostID' : guestReqObject.guest.hostID}]}).exec()
var hostInfo        = model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
update              = guestObject.clearGuestSong (-1, guestInfo.currentTrack.trackID)
var spotifyTrack    = hostAcountTools.spotifyApi.searchTracks (guestReqObject.guest.lastMessage, { limit : 1 })
*/

//message incoming
function HandleIncomingMessage (req, res, db){
  var guestNum      = req.body.From
  var guestMessage  = req.body.Body.toLowerCase().trim()
  var resp          = new twilio.TwimlResponse();
  res.writeHead (200, {'Content-Type': 'text/xml'});

  console.log ('validating guest')
  validateGuest (guestNum, guestMessage)
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
    searchDatabaseForHost (guestObject)
    .then (function (guestObject){
      console.log ('searching database for updated requests')
      return searchDatabaseForTrack (guestObject)
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
    addTracksToPlaylist (guestObject)
    .then (function (guestObject){
      console.log ('added track, updating database')
      return setTrackAddedToPlaylist (guestObject)
    })
    .then (function (guestObject){
      console.log ('clearing guests songs')
      return clearAndAddGuestPreviousRequestInDatabase (guestObject)
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
    incrementSongsRequestsInDatabase (guestObject)
    .then (function (guestObject){
      return (guestObject)
    })
    .then (function (guestObject){
      console.log ('clearing guests songs')
      return clearAndAddGuestPreviousRequestInDatabase (guestObject)
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
    searchSpotify (guestObject)
    .then (function (guestObject){
      console.log ('checking for prev requests')
      return checkForPreviousRequests (guestObject)
    })
    .then (function(guestObject){
      console.log ('incremementing or adding to database')
      return incrementOrAddSongInDatabase (guestObject)
    })
    .then (function (guestObject){
      console.log ('updating guests requests')
      return setGuestCurrentTrack (guestObject)
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

//find the guest in our database by their phone number
//if their number is not found or if they are not apart of anyone's parties currently. They are told they are not a guest.
function validateGuest (guestNumber, message){
  return new Promise (function (fulfill, reject){
    var error = 'error searching for guest in our database'
    model.Guest.findOne({ 'phoneNum' : guestNumber })
    .then (function (guestInfo){
      if (guestInfo){
        if (guestInfo.hostID){
          var guestObject = guestObj.guest (guestInfo)
          guestObject.guest.lastMessage = message
          fulfill (guestObject) 
        }else reject (response.notGuest)
      }else reject (response.notGuest)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

function searchSpotify (guestObject){
  var query = guestObject.guest.lastMessage

  return new Promise (function (fulfill, reject){
    var error = 'error searching spotify for song'
    hostAcountTools.spotifyApi.searchTracks (query, { limit : 1 })//search spotify for a track based on the message we got from the
    .then (function (spotifyTrack){
      if (spotifyTrack.body.tracks.total != 0){ //we found a track on spotify matching the guest message)
        guestObject.track = {
          'trackID'     : spotifyTrack.body.tracks.items[0].id,
          'name'        : spotifyTrack.body.tracks.items[0].name,
          'artist'      : spotifyTrack.body.tracks.items[0].artists[0].name,
          'numRequests' : 0
        }
        fulfill (guestObject)
      }else{ // we did not find a track matching the guests search request so we reject immediatley and respond to them
        guestObject.guest.currentTrack.trackID = null
        clearAndAddGuestPreviousRequestInDatabase (guestObject)
        .then (reject (addResponse.songNotFound))
      }
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

function searchDatabaseForHost (guestObject){
  return new Promise (function (fulfill, reject){
    var query     = {'hostID' : guestObject.guest.hostID}
    var error     = 'error searching for host in database'

    model.Host.findOne(query).exec()
    .then (function (host){
      guestObject.host = host
      fulfill (guestObject)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  }) 
}

function checkForPreviousRequests (guestObject){
  return new Promise (function (fulfill, reject){
    var error = 'The guest has already requested this song'
    for (var i = 0; i < guestObject.guest.prevRequests.length; i++){
      if (guestObject.track.trackID === guestObject.guest.prevRequests[i]){
        //we found that the guest has already requested the same track they searched so reject with that message right away
        reject (addResponse.alreadyRequested (guestObject.track.name, guestObject.track.artist))
      }
    }
    //this is a new request from this guest so continue on the function chain
    fulfill (guestObject)
  })
}

function setGuestCurrentTrack (guestObject){
  return new Promise (function (fulfill, reject){
    var track   = JSONtemplate.setGuestTrack (guestObject.track.trackID, guestObject.track.name, guestObject.track.artist, guestObject.track.numRequests)
    var query   = {'phoneNum' : guestObject.guest.phoneNum}
    var update  = {$set : {'currentTrack' : track}}
    var success = 'successfully set the guest\'s current track in our database'
    var error   = 'error setting the guest\'s current track in our database'

    model.Guest.findOneAndUpdate(query, update).exec()
    .then (function (guest){
      fulfill (guestObject)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

function searchDatabaseForTrack (guestObject){
  return new Promise (function (fulfill, reject){
    var query = {$and: [{ 'trackID' : guestObject.guest.currentTrack.trackID}, {'hostID' : guestObject.host.hostID}]}
    var error = 'error searching for song in our database'

    model.Track.findOne(query)
    .then (function (databaseTrack){
      guestObject.track = databaseTrack
      fulfill (guestObject)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

// the guest has confirmed the last song that they sent to us so we will see about adding it to the playlist.
function clearAndAddGuestPreviousRequestInDatabase (guestObject){
  return new Promise (function (fulfill, reject){
    var query   = { 'phoneNum' : guestObject.guest.phoneNum}
    var update  = guestObj.clearGuestSong (-1, guestObject.guest.currentTrack.trackID)
    var success = guestObject.guest.phoneNum + ' current track successfully cleared'
    var error   = 'there was an error clearing ' +guestObject.guest.phoneNum+ '\'s current song'

    model.Guest.findOneAndUpdate(query, update).exec()
    .then (function (guest){
      console.log ('yup')
      fulfill (guestObject)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

function incrementOrAddSongInDatabase (guestObject){
  return new Promise (function (fulfill, reject){
    var query = {$and: [{ 'trackID' : guestObject.track.trackID}, {'hostID' : guestObject.guest.hostID}]}
    var error = 'there was an error updating the track\'s number of found times in our database'

    model.Track.findOne (query)
    .then (function (track){
      if (track) {
        var update = {$inc: { foundAmount: 1}}
        return model.Track.findOneAndUpdate(query, update).exec()
      }else{
        var update  = JSONtemplate.Track (guestObject.guest.hostID, guestObject.track.trackID, guestObject.track.name, guestObject.track.artist)
        return model.Track.findOneAndUpdate(query, update, {upsert : true}).exec()
      }
    })
    .then (function (track){
      if (track) {
        guestObject.track = track
        fulfill (guestObject)
      }else{
        fulfill (guestObject)
      }
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

function incrementSongsRequestsInDatabase (guestObject){
  return new Promise (function (fulfill, reject){
    var query   = {$and: [{ 'trackID' : guestObject.track.trackID}, {'hostID' : guestObject.host.hostID}]}
    var update  = {$inc: { numRequests: 1}}
    var success = guestObject.track.trackID + ' requests successfully incremented'
    var error   = 'there was an error updating the track\'s number of requests in our database'
    
    model.Track.findOneAndUpdate(query, update)
    .then (function (track){
      fulfill (guestObject)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

function setTrackAddedToPlaylist (guestObject){
  return new Promise (function (fulfill, reject){
    var query   = {$and: [{ 'trackID' : guestObject.track.trackID}, {'hostID' : guestObject.host.hostID}]}
    var update  = {$set: { addedPaylist: true}}
    var success = guestObject.track.trackID + ' successfully added to playlist in database'
    var error   = 'there was an error updating the track as "on playlist" in our database'
    
    model.Track.findOneAndUpdate(query, update).exec()
    .then (function (track){
      fulfill (guestObject)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

function addTracksToPlaylist (guestObject){
  return new Promise (function (fulfill, reject){
    var error = 'there was an error adding the track to the playlist'

    hostAcountTools.spotifyApi.setAccessToken(guestObject.host.access_token)
    hostAcountTools.spotifyApi.addTracksToPlaylist (guestObject.host.hostID, guestObject.host.playlistID, 'spotify:track:'+guestObject.track.trackID)
    .then (function (track){
      fulfill (guestObject)
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
      reject (err)
    })
  })
}

//add track to playlist on spotify
//
// response for succesfully adding song to playlist on spotify
//guestObject.response  = addResponse.songConfirmedAndAdded (track.name, track.artist)

// response for succesfully incrementing a songs request
//guestObject.response = addResponse.songConfirmed (trackName, trackArtist, numRequests, reqThreshold)


/*else if (messageBody === 'yes' && guestInfo.numRequests < 1){
      model.Track.findOne({ 'trackID' : guestInfo.currentTrack.trackID}).exec()
      .then (function (trackFound){
        if (trackFound){
          if (trackFound.numRequests === 2){
            model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
            .then (function (hostInfo){
              hostAcountTools.spotifyApi.addTracksToPlaylist (guestInfo.hostID, hostInfo.playlistID, guestInfo.currentTrack.trackID) 
              .then (function (added){
                console.log (added)
              })  
            })
            guestReqObject.trackUpdate= {$set: { numRequests: 0}}
            guestReqObject.response   = addResponse.songConfirmedAndAddedAndadvertisment (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, trackFound.numRequests)
            return (guestReqObject)
          }else{
            guestReqObject.response   = addResponse.songConfirmedAndadvertisment (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, trackFound.numRequests)
            return (guestReqObject)
          }
        }else {
          guestReqObject.response     = addResponse.songConfirmedAndadvertisment (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, 0)
          return (guestReqObject)
        }
      })
      .then (function (guestReqObject){
        guestReqObject.trackUpdate    = {$inc: { numRequests: 1}}
        guestReqObject.guestUpdate    = guestObject.clearGuestSong (4)
        fulfill (guestReqObject)
      })
    }*/

module.exports = {
  HandleIncomingMessage: HandleIncomingMessage
}
