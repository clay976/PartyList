//node modules
var twilio = require('twilio')

var SpotifyWebApi = require('spotify-web-api-node');
var credentials = {
  clientId : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://104.131.215.55:80/callback'
};

var spotifyApi = new SpotifyWebApi(credentials);
var guestTools = require ('../database/guestTools')
var addResponse = require ('./outgoing/responses')
var model = require ('../database/models')

function businessLogic (req, res, db){
  guestTools.validateGuest (req.body)
  .then (function (guestInfo){
    return (chooseReponseAction (guestInfo))
  })
  .then (function (resp){
    console.log ('sending response: ' +resp.toString())
    res.send (resp.toString())
  })
  .catch (function (err){
    console.log ('something went wrong: '+err.stack)
  })
}

function chooseReponseAction (guestInfo){
  var resp = new twilio.TwimlResponse()
  var messageBody = guestInfo.lastMessage
  if ((messageBody === 'yes' || messageBody === 'no') && guestInfo.trackID === ''){
    return (addResponse.emptyConfirmation (resp))
  }else if (messageBody === 'yes' && guestInfo.numRequests < 1){
    model.Guest.update({ 'phoneNum' : guestInfo.phoneNum }, {$set: { numRequests: 4}})
    return (addResponse.advertisment (resp))
  }else if (messageBody === 'yes'){
    model.Track.findOneAndUpdate({trackID: guestInfo.trackID}, {$inc: { numRequests: 1}})
    model.Guest.update({ 'phoneNum' : guestInfo.phoneNum }, {$inc: { numRequests: -1}, $set: {'currentTrack' : ''}})
    return (addResponse.songConfirmed (resp))
  }else if (messageBody === 'no'){
    model.Guest.update({ 'phoneNum' : guestInfo.phoneNum }, { $set: {'currentTrack' : ''}})
    return (addResponse.declineRequest (resp))
  }else{
    return (searchSpotifyAndBuildResponse (messageBody, resp, guestInfo))
  }
}

function searchSpotifyAndBuildResponse (messageBody, resp, guestInfo){
  return new Promise (function (fulfill, reject){
    spotifyApi.searchTracks (messageBody, { limit : 1 })
    .then (function (tracksFound){
      var track = tracksFound.body.tracks.items[0]
      model.Guest.update({ 'phoneNum' : guestInfo.phoneNum }, { $set: {'currentTrack' : track.id}})
      model.Track.findOneAndUpdate({'trackID': track.id}, upsertTemplate.Track (track.id), {upsert:true})
      .then (function (databaseTrack){
        var requests = databaseTrack.numRequests
        fulfill (addResponse.trackFound (resp, track.name, track.artists[0].name, requests))
      })
      
    })
  })
}

function addSongToPlaylist (host, trackID, toNum, db){
  search.search (host, query.findHost (host), db, function (found){
    spotifyApi.addTracksToPlaylist (userId, playlistId, tracks)
    .then (function (){
      responseBody = 'your song has been added to the playlist'
    })
    .catch (function (err){
      responseBody = ('there was an error adding ' +trackTitle+ ' to the playlist, will provide more usefull erroror messages in the future')
    })
    respond.songAdded (toNum, responseBody)
  })
}

module.exports = {
  businessLogic: businessLogic
}
