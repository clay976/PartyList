//node modules
var twilio = require('twilio')
var sid = 'AC85573f40ef0c3fb0c5aa58477f61b02e'
var atoken = 'fcea26b2b0ae541d904ba23e12e2c499'
var client = require('twilio/lib')(sid, atoken);
var hostAcountTools = require ('../database/hostTools')
var guestTools = require ('../database/guestTools')
var model = require ('../database/models')
var guestObject = require ('./JSONtemps')
var addResponse = require ('./responses')
var upsertTemplate = require ('../database/upsert/JSONtemps')

function HandleIncomingMessage (req, res, db){
  var resp = new twilio.TwimlResponse();
  guestTools.validateGuest (req.body)
  .then (function (guestInfo){
    console.log ('1')
    console.log (guestInfo)
    return buildResponseObject (guestInfo)
  })
  .then (function (responseObject){
    console.log ('2')
    console.log (responseObject)
    if (responseObject.searchSpotify) return addSpotifySearchResultsIfNeeded (responseObject)
    else return responseObject
  })
  .then (function (responseObject){
    console.log ('3')
    console.log (responseObject)
    return guestTools.updateGuestAndTrackIfNeeded (responseObject)
  })
  .then (function (responseObject){
    console.log ('4')
    res.writeHead(200, {'Content-Type': 'text/xml'});
    resp.message = responseObject.response
    console.log (res)
    console.log ('4')
    console.log (resp.toString())
    res.end(resp.toString());
  })
  .catch (function (err){
    console.log ('err')
    console.log (err)
    res.send ('error handling incoming message: '+ err)
  })
}

function buildResponseObject (guestInfo){
  return new Promise (function (fulfill, reject){
    guestReqObject = guestObject.guest (guestInfo)
    var messageBody = guestReqObject.guest.lastMessage
    if ((messageBody === 'yes' || messageBody === 'no') && (guestInfo.currentTrack.trackID === '')){
      reject (addResponse.emptyConfirmation)
    }else if (messageBody === 'yes' && guestInfo.numRequests < 1){
      model.Track.findOne({ 'trackID' : guestInfo.currentTrack.id}).exec()
      .then (function (trackFound){
        if (trackFound){
          guestReqObject.response     = addResponse.songConfirmedAndadvertisment (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, trackFound.numRequests)
          return (guestReqObject)
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
    }else if (messageBody === 'yes'){
      model.Track.findOne({ 'trackID' : guestInfo.currentTrack.id}).exec()
      .then (function (trackFound){
        if (trackFound){
          guestReqObject.response     = addResponse.songConfirmed (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, trackFound.numRequests)
          return (guestReqObject)
        }else {
          guestReqObject.response     = addResponse.songConfirmed (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, 0)
          return (guestReqObject)
        }
      })
      .then (function (guestReqObject){
        guestReqObject.trackUpdate    = {$inc: { numRequests: 1}}
        guestReqObject.guestUpdate    = guestObject.clearGuestSong (-1)
        fulfill (guestReqObject)
      })
    }else if (messageBody === 'no'){
      guestReqObject.guestUpdate      = guestObject.clearGuestSong (0)
      guestReqObject.response         = addResponse.declineRequest
      fulfill (guestReqObject)
    }else{
      guestReqObject.searchSpotify    = true
      fulfill (guestReqObject)
    }
  })
}

function addSpotifySearchResultsIfNeeded (guestReqObject){
  return new Promise (function (fulfill, reject){
    hostAcountTools.spotifyApi.searchTracks (guestReqObject.guest.lastMessage, { limit : 1 })
    .then (function (tracksFound){
      if (tracksFound.body.tracks.total != 0){
        var track                     = tracksFound.body.tracks.items[0]
        var resp                      = addResponse.trackFoundOnSpotify (track.id, track.name, track.artists[0].name)
        resp.then (function (resp){
          guestReqObject.response     = resp
          guestReqObject.guestUpdate  = {$set : {
            currentTrack              : {
              trackID                 : track.id, 
              name                    : track.name, 
              artist                  : track.artists[0].name
            }
          }}
          guestReqObject.trackUpdate  = {$set :{
            trackID                 : track.id,
            name                    : track.name,
            artist                  : track.artists[0].name,
            numRequests             : 0,
            timePlayed              : 0 
          }}
          fulfill (guestReqObject)
        })
      }else{
        reject (addResponse.songNotFound)
      }
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
      return ('your song has been added to the playlist')
    })
    .catch (function (err){
      return ('there was an error adding ' +trackTitle+ ' to the playlist')
    })
  })
}

module.exports = {
  HandleIncomingMessage: HandleIncomingMessage
}
