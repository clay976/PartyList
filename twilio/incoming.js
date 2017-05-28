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
var dataBaseTrack             = model.Track.findOne({$and: [{ 'trackID' : guestObject.guest.currentTrack.trackID}, {'hostID' : guestObject.guest.hostID}]}).exec()
var hostInfo                  = model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
guestObject.guestUpdate    = guestObject.clearGuestSong (-1, guestInfo.currentTrack.trackID)
var spotifyTrack              = hostAcountTools.spotifyApi.searchTracks (guestObject.guest.lastMessage, { limit : 1 })
*/

//message incoming
function HandleIncomingMessage (req, res, db){
  console.log ('incoming text')
  console.log ('from: ' +req.body.From+ ', message: '+ req.body.Body)
  var resp = new twilio.TwimlResponse();
  res.writeHead(200, {'Content-Type': 'text/xml'});
  //make sure the guest is actually a guest of a party.
  guestTools.validateGuest (req.body)
  .then (function (guestInfo){
    //check the state of the guest wether they are searching or confirming
    return (checkGuestStateAndPerformAction (guestInfo))
  })
  .then (function (responseObject){
    return guestTools.updateGuestAndTrackIfNeeded (responseObject)
  })
  .then (function (responseObject){
    console.log ('sending to guest: ' +responseObject.response)
    resp.message (responseObject.response)
    res.end(resp.toString());
  })
  .catch (function (err){
    console.log ('sending rejection to guest' +err.stack)
    resp.message ('sorry, we had an error on our end. Please try again.')
    res.end(resp.toString());
  })
}

// Checks to see if a guest is requesting a new track or if they are confirming an already searched track
// Other state checking will be added here for additional options that the guest can send up (things like
// advertising opt outs and stuff)
function checkGuestStateAndPerformAction (guestInfo){
  return new Promise (function (fulfill, reject){
    var guestObject = guestObj.guest (guestInfo)
    var messageBody = guestInfo.lastMessage
    //guest is confirming the last track that we have for them
    if ((messageBody === 'yes') && (guestInfo.currentTrack.trackID != '')){
      console.log ('finding host')
      guestObject.spotifyTrack = guestInfo.currentTrack
      model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
      //model.Track.findOne({ 'trackID' : guestInfo.currentTrack.trackID}).exec()
      .then  (function (hostInfo){
        console.log ('found host')
        guestObject.hostInfo = hostInfo
        return (guestObject)
      })
      .then (function (guestObject){
        console.log ('searching database for updated requests')
        console.log (guestObject)
        return searchDatabaseForTrack (guestObject)
      })
      .then (function (guestObject){
        console.log ('confirming track')
        handleTrackConfirmation (guestObject)
      })
      .catch (function (err){
        console.log (err.stack)
        reject (err)
      })
    }
    //guest is searching a new song because we have not matched any other string in their message to our dictionairy
    else{
      searchSpotify (guestObject)
      .then (function (guestObject){
        //search our database fo the track 
        return searchDatabaseForTrack (guestObject)
      })
      .then (function (guestObject){
        //check to seee if the guest has requested this track before
        fulfill (checkForPreviousRequests (guestObject))
      })
      .catch (function (err){
        console.log (err.stack)
        reject (err)
      })
    }
  })
}

function searchSpotify (guestObject){
  return new Promise (function (fulfill, reject){
    //search spotify for a track based on the message we got from the
    hostAcountTools.spotifyApi.searchTracks (guestObject.guest.lastMessage, { limit : 1 })
    .then (function (spotifyTrack){
      //we found a track on spotify matching the guest message
      if (spotifyTrack.body.tracks.total != 0){
        guestObject.spotifyTrack = spotifyTrack.body.tracks.items[0]
        guestObject.guestUpdate = JSONtemplate.setGuestTrack (guestObject.spotifyTrack.id, guestObject.spotifyTrack.name, guestObject.spotifyTrack.artists[0].name)
        fulfill (guestObject)
      }
      // we did not find a track matching the guests search request so we reject immediatley and respond to them
      else{
        reject (addResponse.songNotFound)
      }
    })
    .catch (function (err){
      console.log (err.stack)
      reject (err)
    })
  })
}

function searchDatabaseForTrack (guestObject){
  return new Promise (function (fulfill, reject){
    model.Track.findOne({$and: [{ 'trackID' : guestObject.spotifyTrack.id}, {'hostID' : guestObject.guest.hostID}]}).exec()
    .then (function (databaseTrack){
      //the track the guest has searched has already been added to the playlist so reject right away and tell them that
      if (databaseTrack && databaseTrack.addedPaylist){
        console.log ('added already')
        reject (addResponse.alreadyAdded (databaseTrack.name, databaseTrack.artist, databaseTrack.numRequests + 1))
      }
      //this track was found in our database so we are going to log that info (might be useful to know what tracks get searched most)
      else if (databaseTrack){
        console.log ('not on playlist, but in database')
        guestObject.databaseTrack = databaseTrack
        guestObject.trackUpdate = {$inc: { foundAmount: 1}}
        fulfill (guestObject)
      }
      // the track was not found in our database so we are going to add it. That way we can log additional info about it and use it late if it is confirmed
      else{
        console.log ('new track in database')
        guestObject.databaseTrack = JSONtemplate.Track (guestObject.guest.hostID, guestObject.spotifyTrack.id, guestObject.spotifyTrack.name, guestObject.spotifyTrack.artist)
        model.Track.findOneAndUpdate ({$and: [{ 'trackID' : guestObject.spotifyTrack.id}, {'hostID' : guestObject.guest.hostID}]}, guestObject.databaseTrack, {upsert:true}).exec()
        fulfill (guestObject)
      }
    })
    .catch (function (err){
      console.log (err.stack)
      reject (addResponse.error())
    })
  })
}

function checkForPreviousRequests (guestObject){
  return new Promise (function (fulfill, reject){
    console.log ('checking for requests')
    for (var i = 0; i < guestObject.guest.prevRequests.length; i++){
      if (guestObject.spotifyTrack.id === guestObject.guest.prevRequests[i]){
        //we found that the guest has already requested the same track they searched so reject with that message right away
        reject (addResponse.youAlreadyRequested (guestObject.databaseTrack.name, guestObject.databaseTrack.artist))
      }
    }
    //this is a new request from this guest so continue on the function chain
    guestObject.response = addResponse.askToConfirm (guestObject.databaseTrack.name, guestObject.databaseTrack.artist, guestObject.databaseTrack.numRequests)
    fulfill (guestObject)
  })
}

// the guest has confirmed the last song that they sent to us so we will see about adding it to the playlist.
function handleTrackConfirmation (guestObject){
  console.log (guestObject)
  return new Promise (function (fulfill, reject){
    if (guestObject.databaseTrack.numRequests === (guestObject.hostInfo.reqThreshold - 1)){
      console.log ('attempting to add track to playlist')
      addTrackToPlaylist (guestObject, guestObject.hostInfo, guestObject.databaseTrack)
      .then (function (guestObject){
        fulfill (guestObject)
      })
      .catch (function (err){
        console.log (err.stack)
        reject (err)
      })
    }
    // the song has been confirmed but will not be added to the playlist yet
    else{
      console.log ('incrementing song\'s request')
      guestObject.trackUpdate= {$inc: { numRequests: 1}}
      guestObject.response   = addResponse.songConfirmed (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, track.numRequests, guestObject.reqThreshold)
      fulfill (guestObject)
    }
  })
  .catch (function (err){
    console.log (err.stack)
  })
}

function addTrackToPlaylist (guestObject, hostInfo, track){
  return new Promise (function (fulfill, reject){
    hostAcountTools.spotifyApi.setAccessToken(hostInfo.access_token)
    hostAcountTools.spotifyApi.addTracksToPlaylist (hostInfo.hostID, hostInfo.playlistID, 'spotify:track:'+track.trackID)
    .then (function (songAdded){
      guestObject.trackUpdate = {$set: { addedPaylist: true}}
      guestObject.response    = addResponse.songConfirmedAndAdded (guestObject.currentTrack.name, guestObject.currentTrack.artist, track.numRequests)
      fulfill (guestObject)
    })
    .catch (function (err){
      console.log (err.stack)
      reject (err)
    })
  })
}

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
            guestObject.trackUpdate= {$set: { numRequests: 0}}
            guestObject.response   = addResponse.songConfirmedAndAddedAndadvertisment (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, trackFound.numRequests)
            return (guestObject)
          }else{
            guestObject.response   = addResponse.songConfirmedAndadvertisment (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, trackFound.numRequests)
            return (guestObject)
          }
        }else {
          guestObject.response     = addResponse.songConfirmedAndadvertisment (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, 0)
          return (guestObject)
        }
      })
      .then (function (guestObject){
        guestObject.trackUpdate    = {$inc: { numRequests: 1}}
        guestObject.guestUpdate    = guestObject.clearGuestSong (4)
        fulfill (guestObject)
      })
    }*/

module.exports = {
  HandleIncomingMessage: HandleIncomingMessage
}
