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
var dataBaseTrack             = model.Track.findOne({$and: [{ 'trackID' : guestReqObject.guest.currentTrack.trackID}, {'hostID' : guestReqObject.guest.hostID}]}).exec()
var hostInfo                  = model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
guestReqObject.guestUpdate    = guestObject.clearGuestSong (-1, guestInfo.currentTrack.trackID)
var spotifyTrack              = hostAcountTools.spotifyApi.searchTracks (guestReqObject.guest.lastMessage, { limit : 1 })
*/

//message incoming
function HandleIncomingMessage (req, res, db){
  console.log ('incoming text from: ' +req.body.From+ ', message: '+ req.body.Body)
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
    if (err.stack){
      console.log ('error stack: ' +err.stack)
      resp.message ('sorry, we had an error on our end. Please try again')
      res.end(resp.toString());  
    }else{
      console.log ('received error: ' +err)
      resp.message (err)
      res.end(resp.toString());
    }
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
      model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
      .then  (function (hostInfo){
        console.log ('found host')
        guestObject.hostInfo = hostInfo
        return (guestObject)
      })
      .then (function (guestObject){
        console.log ('searching database for updated requests')
        return searchDatabaseForTrack (guestObject)
      })
      .then (function (guestObject){
        console.log ('confirming track')
        fulfill (handleTrackConfirmation (guestObject))
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
        var track = JSONtemplate.setGuestTrack (spotifyTrack.body.tracks.items[0].id, spotifyTrack.body.tracks.items[0].name, spotifyTrack.body.tracks.items[0].artists[0].name)
        return (track)
      }
// we did not find a track matching the guests search request so we reject immediatley and respond to them
      else{
        reject (addResponse.songNotFound)
      }
    })
    .then (function (track){
      guestObject.guest.currentTrack = track
      return (model.Guest.findOneAndUpdate({ 'phoneNum' : guestObject.guest.phoneNum}, {$set : {'currentTrack'  : track}}).exec())
    })
    .then (function (guest){
      fulfill (guestObject)
    })
    .catch (function (err){
      console.log (err.stack)
      reject (err)
    })
  })
}

function searchDatabaseForTrack (guestObject){
  return new Promise (function (fulfill, reject){
    model.Track.findOne({$and: [{ 'trackID' : guestObject.guest.currentTrack.trackID}, {'hostID' : guestObject.guest.hostID}]}).exec()
    .then (function (databaseTrack){
      //the track the guest has searched has already been added to the playlist so reject right away and tell them that
      if (databaseTrack && databaseTrack.addedPaylist){
        console.log ('track added already to playlist')
        guestObject.trackUpdate = {$inc: { foundAmount: 1}}
        reject (addResponse.alreadyAdded (databaseTrack.name, databaseTrack.artist))
      }
      //this track was found in our database so we are going to log that info (might be useful to know what tracks get searched most)
      else if (databaseTrack){
        console.log ('track not on playlist, but in database')
        guestObject.databaseTrack = databaseTrack
        guestObject.trackUpdate = {$inc: { foundAmount: 1}}
        return (guestObject)
      }
      // the track was not found in our database so we are going to add it. That way we can log additional info about it and use it late if it is confirmed
      else{
        console.log ('new track in database (should only happen on searches)')
        guestObject.trackUpdate = JSONtemplate.Track (guestObject.guest.hostID, guestObject.guest.currentTrack.trackID, guestObject.guest.currentTrack.name, guestObject.guest.currentTrack.artist)
        guestObject.databaseTrack = JSONtemplate.Track (guestObject.guest.hostID, guestObject.guest.currentTrack.trackID, guestObject.guest.currentTrack.name, guestObject.guest.currentTrack.artist)
        return (guestObject)
      }
    })
    .then (function (guestObject){    
      model.Track.findOneAndUpdate({$and: [{ 'trackID' : guestObject.guest.currentTrack.trackID}, {'hostID' : guestObject.guest.hostID}]}, guestObject.trackUpdate, {upsert:true}).exec()
      fulfill (guestObject) 
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
      if (guestObject.guest.currentTrack.trackID === guestObject.guest.prevRequests[i]){
        //we found that the guest has already requested the same track they searched so reject with that message right away
        reject (addResponse.alreadyRequested (guestObject.guest.currentTrack.name, guestObject.guest.currentTrack.artist))
      }
    }
    //this is a new request from this guest so continue on the function chain
    guestObject.response = addResponse.askToConfirm (guestObject.databaseTrack.name, guestObject.databaseTrack.artist, guestObject.databaseTrack.numRequests)
    fulfill (guestObject)
  })
}

// the guest has confirmed the last song that they sent to us so we will see about adding it to the playlist.
function handleTrackConfirmation (guestObject){
  return new Promise (function (fulfill, reject){
    model.Guest.findOneAndUpdate({ 'phoneNum' : guestObject.guest.phoneNum}, {$push: {'prevRequests' : guestObject.guest.currentTrack.trackID}})
    .then (function (update){
      if (guestObject.databaseTrack.numRequests === (guestObject.hostInfo.reqThreshold - 1)){
        console.log ('attempting to add track to playlist')
        addTrackToPlaylist (guestObject, guestObject.hostInfo, guestObject.guest.currentTrack)
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
        var trackUpdate = {$inc: { numRequests: 1}}
        
        model.Track.findOneAndUpdate({$and: [{ 'trackID' : guestObject.guest.currentTrack.trackID}, {'hostID' : guestObject.hostInfo.hostID}]}, trackUpdate).exec()
        guestObject.response    = addResponse.songConfirmed (guestObject.guest.currentTrack.name, guestObject.guest.currentTrack.artist, guestObject.databaseTrack.numRequests, guestObject.hostInfo.reqThreshold)
        fulfill (guestObject)
      }
    })
  })
  .catch (function (err){
    console.log (err.stack)
  })
}

function addTrackToPlaylist (guestObject, hostInfo, track){
  return new Promise (function (fulfill, reject){
    var trackUpdate = {$set: { addedPaylist: true}}
    guestObject.response    = addResponse.songConfirmedAndAdded (track.name, track.artist)

    hostAcountTools.spotifyApi.setAccessToken(hostInfo.access_token)
    hostAcountTools.spotifyApi.addTracksToPlaylist (hostInfo.hostID, hostInfo.playlistID, 'spotify:track:'+track.trackID)
    .then (model.Track.findOneAndUpdate({$and: [{ 'trackID' : track.trackID}, {'hostID' : hostInfo.hostID}]}, trackUpdate).exec())
    .then (fulfill (guestObject))
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
