//node modules
var twilio = require('twilio')
var SpotifyWebApi = require('spotify-web-api-node');

var credentials = {
  clientId : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://104.131.215.55:80/callback'
};

var spotifyApi = new SpotifyWebApi(credentials);
// mongo variables
var guestTools = require ('../database/guestTools')
var upsertTemplate = require ('../database/upsert/JSONtemps')
// message variables
var addResponse = require ('./outgoing/responses')
var model = require ('../database/models')

function businessLogic (req, res, db){
  guestTools.validateGuest (req.body)
  .then (function (guestInfo){ // change to: .then (decideResponse (guestInfo))
    var resp = new twilio.TwimlResponse()
    var messageBody = guestInfo.lastMessage
    if ((messageBody === 'yes' || messageBody === 'no') && guestInfo.trackID === ''){
      return (addResponse.emptyConfirmation (resp))
    }else if (messageBody === 'yes' && guestInfo.numRequests < 1){
      model.Guest.update({ 'phoneNum' : guestInfo.phoneNum }, {$set: { numRequests: 4}}).exec()
      return (addResponse.advertisment (resp))
    }else if (messageBody === 'yes'){
      model.Track.findOneAndUpdate({trackID: guestInfo.trackID}, {$inc: { numRequests: 1}}).exec()
      return (addResponse.advertisment (resp))
    }else if (messageBody === 'no'){
      model.Guest.update({ 'phoneNum' : guestInfo.phoneNum }, { $set: {'currentTrack' : ''}}).exec()
      return (addResponse.declineRequest (resp))
    }else{
      return (searchSpotifyAndBuildResponse (messageBody, resp, guestInfo))
    }
  })
  .then (function (resp){
    console.log ('sending response: ' +resp.toString())
    res.send (resp.toString())
  })
  .catch (function (err){
    console.log ('something went wrong: '+err.stack)
  })
}

function searchSpotifyAndBuildResponse (messageBody, resp, guestInfo){
  return new Promise (function (fulfill, reject){
    spotifyApi.searchTracks (messageBody, { limit : 1 })
    .then (function (tracksFound){
      var track = tracksFound.body.tracks.items[0]
      model.Guest.update({ 'phoneNum' : guestInfo.phoneNum }, { $set: {'currentTrack' : track.id}}).exec()
      model.Track.findOneAndUpdate({'trackID': track.id}, upsertTemplate.Track (track.id), {upsert:true}).exec()
      fulfill (addResponse.trackFound (resp, track.name, track.artists[0].name))
    })
  })
}

/*
function searchRequest(res, db, toNum, options, guestFound){  
  request.get(options, function (error, response, body) {
    if (error) {
      respond.searchError (res)
    }else{
      trackAdd = JSON.parse(body)
      if (trackAdd.tracks.total>0){
        db.collection('guests').updateOne(guestFound, updateTemplate.guestRequest (trackAdd.tracks.items[0].id), updateResponseHandler)
        respond.askConfirmation (res, db, trackAdd)
      }else{
        respond.songNotFound (res)
      }
    }
  })
}

function requestConfirmed (res, db, toNum, guestFound, trackID){
  
  search.search ('tracks', searchTemplate.findTrack (trackID), db, function (trackDocFound){
    if (trackDocFound){
      respond.requestedAlready (res, guestFound.numRequests, trackDocFound.numRequests)
      db.collection('tracks').updateOne(trackDocFound, updateTemplate.tracksReqd, updateResponseHandler)
    }else{        
      respond.newRequest (res, guestFound.numRequests)
      db.collection('tracks').insertOne(insertTemplate.track(trackID), insertResponseHandler)
    }
  })
  addSongToPlaylist (guestFound.host, trackID, toNum, db)
  db.collection('guests').updateOne(guestFound, update.guestConfirm (), updateResponseHandler)
}

function addSongToPlaylist (host, trackID, toNum, db){
  search.search (host, query.findHost (host), db, function (found){
    request.post(SpotifyPlaylistJSON.addSongToPlaylist (host, found.playlistID, trackID, found.access_token), function(error, response, body) {
      if (error){
        responseBody = ('there was an error adding ' +trackTitle+ ' to the playlist, will provide more usefull erroror messages in the future')
      }else{
        responseBody = 'your song has been added to the playlist'
      }
      respond.songAdded (toNum, responseBody)
    })
  })
}
*/
module.exports = {
  businessLogic: businessLogic
}
