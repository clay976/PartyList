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
var respond = require ('./outgoing/responses')

function businessLogic (req, res, db){
  guestTools.validateGuest (req.body)
  .then (function (guestInfo){ // change to: .then (decideResponse (guestInfo))
    var resp = new twilio.TwimlResponse();
    var messageBody = guestInfo.lastMessage
    var requests
    if ((messageBody === 'yes' || messageBody === 'no') && guestInfo.trackID === ''){
      addResponse.emptyConfirmation (resp)
      return resp
    }else if (messageBody === 'yes'){
      if (guestInfo.numRequests < 1){
        addResponse.advertisment (resp)
        model.Guest.update({ 'phoneNum' : guestInfo.phoneNum }, {$set: { numRequests: 4}}).exec()
      }
      model.Track.findOneAndUpdate({trackID: guestInfo.trackID}, {$inc: { numRequests: 1}}).exec()
      addResponse.advertisment (resp)
      return resp
    }else if (messageBody === 'no'){
      model.Guest.update({ 'phoneNum' : guestInfo.phoneNum }, { $set: {'currentTrack' : ''}}).exec()
      addResponse.declineRequest (resp)
      return resp
    }else{
      console.log ('searching for tracks with name: '+ messageBody)
      spotifyApi.searchTracks (messageBody, { limit : 1 })
      .then (function (tracksFound){
        console.log ('tracks: ' +tracksFound)
        console.log ('trackID: ' +trackAdd.tracks.items)
        model.Track.findOneandUpdate({'trackID': trackAdd.tracks.items[0].id}, upsertTemplate (trackAdd.tracks.items[0].id), {upsert:true}).exec()
        .then (function (trackFound){
          if (trackFound) requests = trackFound.numRequests
          else requests = 0
          addResponse.trackFound (resp, tracksFound.tracks.items[0].name, trackAdd.tracks.items[0].artists[0].name)
          return resp
        })
        .catch (function (err){
          res.status(400).send ('something went wrong: '+err)
        })
      })
      .catch (function (err){
        res.status(400).send ('something went wrong: '+err)
      })
    }
  })
  .then (function (resp){
    console.log ('resp: ' +resp)
    res.send (resp.toString())
  })
  .catch (function (err){
    res.status(400).send ('something went wrong: '+err)
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
