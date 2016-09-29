//node modules
var twilio = require('twilio')
var hostAcountTools = require ('../database/hostTools')
var guestTools = require ('../database/guestTools')
var guestObject = require ('./JSONtemps')
var addResponse = require ('./responses')
var model = require ('../database/models')
var upsertTemplate = require ('../database/upsert/JSONtemps')

function HandleIncomingMessage (req, res, db){
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
    console.log (responseObject.response)
    res.send (responseObject.response)
  })
  .catch (function (err){
    //var resp = new twilio.TwimlResponse()
    res.send ('error handling incoming message: '+ err)
  })
}

function buildResponseObject (guestInfo){
  return new Promise (function (fulfill, reject){
    guestReqObject = guestObject.guest (guestInfo)
    var messageBody = guestReqObject.guest.lastMessage
    if ((messageBody === 'yes' || messageBody === 'no') && (guestInfo.currentTrack.id === '')){
      reject (addResponse.emptyConfirmation)
    }else if (messageBody === 'yes' && guestInfo.numRequests < 1){
      guestReqObject.response       = addResponse.songConfirmedAndadvertisment ()
      guestReqObject.trackUpdate    = {$inc: { numRequests: 1}}
      guestReqObject.guestUpdate    = {$set: { numRequests: 4}}
      fulfill (guestReqObject)
    }else if (messageBody === 'yes'){
      guestReqObject.response       = addResponse.songConfirmed ()
      guestReqObject.guestUpdate    = {$inc: { numRequests: -1}, $set: {'currentTrack' : ''}}
      guestReqObject.trackUpdate    = {$inc: { numRequests: 1}}
      fulfill (guestReqObject)
    }else if (messageBody === 'no'){
      guestReqObject.guestUpdate    = {$inc: { numRequests: -1}, $set: {'currentTrack' : ''}}
      fulfill (guestReqObject)
    }else{
      guestReqObject.searchSpotify  = true
      fulfill (guestReqObject)
    }
  })
}

function addSpotifySearchResultsIfNeeded (guestReqObject){
  return new Promise (function (fulfill, reject){
    hostAcountTools.spotifyApi.searchTracks (guestReqObject.guest.lastMessage, { limit : 1 })
    .then (function (tracksFound){
      var track = tracksFound.body.tracks.items[0]
      guestReqObject.response     = addResponse.trackFound (track.id, track.name, track.artists[0].name)
      guestReqObject.guestUpdate  = {currentTrack : {id : track.id, name : track.name, artist : track.artists[0].name}}
      guestReqObject.trackUpdate  = upsertTemplate.Track (track.id, track.name, track.artists[0].name)
      fulfill (guestReqObject)
    })
    .catch (function (err){
      reject ('error searching spotify for track: ' +err)
    })
  })
}

function addSongToPlaylist (host, trackID, toNum, db){
  search.search (host, query.findHost (host), db, function (found){
    hostAcountTools.spotifyApi.addTracksToPlaylist (userId, playlistId, tracks)
    .then (function (){
      return 'your song has been added to the playlist'
    })
    .catch (function (err){
      return ('there was an error adding ' +trackTitle+ ' to the playlist')
    })
  })
}

module.exports = {
  HandleIncomingMessage: HandleIncomingMessage
}
