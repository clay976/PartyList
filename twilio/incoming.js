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
var guestObject     = require ('./JSONtemps')

function HandleIncomingMessage (req, res, db){
  console.log ('incoming text')
  console.log ('from: '+ req.body.From+ ', message: '+ req.body.Body)
  var resp = new twilio.TwimlResponse();
  res.writeHead(200, {'Content-Type': 'text/xml'});
  guestTools.validateGuest (req.body)
  .then (function (guestInfo){
    return buildResponseObject (guestInfo)
  })
  .then (function (responseObject){
    if (responseObject.searchSpotify) return addSpotifySearchResultsIfNeeded (responseObject)
    else return responseObject
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
    console.log (err.stack)
    resp.message (err)
    res.end(resp.toString());
  })
}

function buildResponseObject (guestInfo){
  return new Promise (function (fulfill, reject){
    guestReqObject = guestObject.guest (guestInfo)
    var messageBody = guestReqObject.guest.lastMessage
    if ((messageBody === 'yes') && (guestInfo.currentTrack.trackID === '')){
      reject (addResponse.emptyConfirmation)
    // guest is confirming the last song we sent to them
    }else if (messageBody === 'yes'){
      var track = model.Track.findOne({$and: [{ 'trackID' : guestReqObject.guest.currentTrack.trackID}, {'hostID' : guestReqObject.guest.hostID}]}).exec()
      var hostInfo = model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
      Promise.all ([track, hostInfo])
      .then (handleTrackDatabaseSearch (values))
      .then (function (guestReqObject){
        guestReqObject.guestUpdate    = guestObject.clearGuestSong (-1, guestInfo.currentTrack.trackID)
        fulfill (guestReqObject)
      })
    }else{
      guestReqObject.searchSpotify    = true
      fulfill (guestReqObject)
    }
  })
}

function addSpotifySearchResultsIfNeeded (guestReqObject){
  return new Promise (function (fulfill, reject){
    var track
    hostAcountTools.spotifyApi.searchTracks (guestReqObject.guest.lastMessage, { limit : 1 })
    .then (function (tracksFound){
      if (tracksFound.body.tracks.total != 0){
        track = tracksFound.body.tracks.items[0]
        return (model.Track.findOne({$and: [{ 'trackID' : track.id}, {'hostID' : guestReqObject.guest.hostID}]}).exec())
      }else{
        reject (addResponse.songNotFound)
      }
    })
    .then (function (foundSong){
      if (foundSong) guestReqObject.trackUpdate = {$inc: { foundAmount: 1}}
      else {
        var debug = JSONtemplate.Track (guestReqObject.guest.hostID, track.id, track.name, track.artists[0].name)
        model.Track.findOneAndUpdate({$and: [{ 'trackID' : track.id}, {'hostID' : guestReqObject.guest.hostID}]}, debug, {upsert:true}).exec()
      }
    })
    trackFoundOnSpotify (guestReqObject.guest.hostID, track.id, track.name, track.artists[0].name, guestReqObject.guest.prevRequests)
    .then (function (resp){
      guestReqObject.response     = resp
      guestReqObject.guestUpdate  = JSONtemplate.setGuestTrack (track.id, track.name, track.artists[0].name)
      fulfill (guestReqObject)
    })
    .catch (function (err){
      reject (err)  
    })
  })
}

function addTrackToPlaylist (guestReqObject, hostInfo, track){
  hostAcountTools.spotifyApi.setAccessToken(hostInfo.access_token)
  hostAcountTools.spotifyApi.addTracksToPlaylist (guestInfo.hostID, hostInfo.playlistID, 'spotify:track:'+track.trackID)
  guestReqObject.trackUpdate = {$set: { addedPaylist: true}}
  guestReqObject.response    = addResponse.songConfirmedAndAdded (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, track.numRequests)
  return (guestReqObject)
}

function trackFoundOnSpotify (hostID, trackID, title, artist, prevReqs){
  return new Promise (function (fulfill, reject){
    var trackFound = model.Track.findOne({$and: [{ 'trackID' : trackID}, {'hostID' : hostID}]}).exec()
    var prevRequests = checkForPreviousRequests (trackID, prevReqs)
    Promise.all ([trackFound, prevRequests])
    .then (function (values){ 
      trackFound = values[0]
      prevRequests = values[1]
      if (trackFound && trackFound.addedPaylist)  reject (addResponse.alreadyAdded (title, artist, trackFound.numRequests + 1))
      else if (trackFound && prevRequests)        reject (addResponse.youAlreadyRequested (title, artist))
      else if (trackFound)                        fulfill (addResponse.askToConfirm (title, artist, trackFound.numRequests))
    })
    .catch (function (err){
      reject (err)
    })
  })
}

function checkForPreviousRequests (trackID, prevRequests){
  return new Promise (function (fulfill, reject){
    for (var i = 0; i < prevRequests.length; i++){
      if (trackID === prevRequests[i]){
        fulfill (true)
      }
    }
    fulfill (false)
  })
}

function handleTrackDatabaseSearch (values){
  return new Promise (function (fulfill, reject){
    track = values[0]
    hostInfo = values[1]
    // the track was found in our database because someone already searched for it (possibly the person confirming it)
    if (track){
      // the song has met the number of requests to be added to the playlist
      if (track.numRequests === (hostInfo.reqThreshold - 1)) return addTrackToPlaylist (guestReqObject, hostInfo, track)
      // the song has been confirmed but will not be added to the playlist yet
      else{
        guestReqObject.trackUpdate= {$inc: { numRequests: 1}}
        guestReqObject.response   = addResponse.songConfirmed (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, track.numRequests)
        return (guestReqObject)
      }
    // the track is new so the guest will be informed that they have confirmed and it 
    }else{
      guestReqObject.trackUpdate  = {$inc: { numRequests: 1}}
      guestReqObject.response     = addResponse.songConfirmed (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, 0)
      return (guestReqObject)
    }
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
