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
    console.log ('sending to guest')
    console.log (responseObject.response)
    resp.message (responseObject.response)
    res.end(resp.toString());
  })
  .catch (function (err){
    console.log (err)
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
    }/*else if (messageBody === 'yes' && guestInfo.numRequests < 1){
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
    }*/else if (messageBody === 'yes'){
      model.Track.findOne({$and: [{ 'trackID' : guestReqObject.guest.currentTrack.trackID}, {'hostID' : guestReqObject.guest.hostID}]}).exec()
      .then (function (trackFound){
        console.log ('track: '+trackFound)
        if (trackFound){
          if (trackFound.numRequests === 1){
            model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
            .then (function (hostInfo){
              hostAcountTools.spotifyApi.setAccessToken(hostInfo.access_token)
              hostAcountTools.spotifyApi.addTracksToPlaylist (guestInfo.hostID, hostInfo.playlistID, 'spotify:track:'+trackFound.trackID)
              .then (function (added){
              })  
              .catch (function (err){
                console.log (err)
              }) 
            })
            .catch (function (err){
              console.log (err)
            }) 
            guestReqObject.trackUpdate= {$set: { addedPaylist: true}}
            guestReqObject.response   = addResponse.songConfirmedAndAdded (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, trackFound.numRequests)
            return (guestReqObject)
          }else{
            guestReqObject.trackUpdate= {$inc: { numRequests: 1}}
            guestReqObject.response   = addResponse.songConfirmed (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, trackFound.numRequests)
            return (guestReqObject)
          }
        }else { 
          guestReqObject.trackUpdate  = {$inc: { numRequests: 1}}
          guestReqObject.response     = addResponse.songConfirmed (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, 0)
          return (guestReqObject)
        }
      })
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
        track                         = tracksFound.body.tracks.items[0]
        model.Track.findOne({$and: [{ 'trackID' : track.id}, {'hostID' : guestReqObject.guest.hostID}]}).exec()
        .then (function (foundSong){
          if (foundSong) guestReqObject.trackUpdate        = {$inc: { foundAmount: 1}}
          else {
            var debug = upsertTemplate.Track (guestReqObject.guest.hostID, track.id, track.name, track.artists[0].name)
            console.log (debug)
            model.Track.findOneAndUpdate({$and: [{ 'trackID' : track.id}, {'hostID' : guestReqObject.guest.hostID}], debug, {upsert:true}).exec()
          }
        })
        var resp                      = addResponse.trackFoundOnSpotify (guestReqObject.guest.hostID, track.id, track.name, track.artists[0].name, guestReqObject.guest.prevRequests)
        resp
        .then (function (resp){
          guestReqObject.response     = resp
          guestReqObject.guestUpdate  = {$set : {
            currentTrack              : {
              trackID                 : track.id, 
              name                    : track.name, 
              artist                  : track.artists[0].name
            }
          }}
          fulfill (guestReqObject)
        })
        .catch (function (err){
          reject (err)  
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

module.exports = {
  HandleIncomingMessage: HandleIncomingMessage
}
