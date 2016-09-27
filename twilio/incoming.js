//node modules
var twilio = require('twilio')
var hostAcountTools = require ('../../database/hostTools')
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
    hostAcountTools.spotifyApi.searchTracks (messageBody, { limit : 1 })
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
  businessLogic: businessLogic
}
