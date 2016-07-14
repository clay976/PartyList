//node modules
var request = require('request') // "Request" library

// mongo variables
var search = require ('../database/query/search')
var updateResponseHandler = require ('../database/update/responseHandler')
var updateTemplate = require ('../database/update/JSONtemps')
var insertResponseHandler = require ('../database/insert/responseHandler')
var insertTemplate = require ('../database/insert/JSONtemps')

// message variables
var respond = require ('./responses')

//my modules
var SpotifyPlaylistJSON = require ('../spotify/playlist/JSONtemps')

function incoming (res, db, toNum, guestFound, messageBody){
  var trackID = guestFound.currentTrack
  if ((messageBody.toLowerCase() === 'yes' || messageBody.toLowerCase() === 'no') && trackID === ''){
    respond.emptyConfirmation (res)
  }else{
    if (messageBody.toLowerCase() === 'yes'){
      requestConfirmed (res, db, toNum, guestFound, trackID)
    }else if (messageBody.toLowerCase() === 'no'){
      respond.declineRequest (res)
      db.collection('guests').updateOne(guestFound, updateTemplate.guestRequest (''), updateResponseHandler)
    }else{
      searchRequest(res, db, toNum, {url: 'https://api.spotify.com/v1/search?q=' +messageBody+ '&type=track&limit=1'}, guestFound)
    }
  }
}

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
  var trackObjID = query.findTrack (trackID)
  var guestRequestsLeft = guestFound.numRequests
  var decrementGuest = update.guestConfirm ()
  var host = guestFound.host
  if (guestRequestsLeft < 1){
    dbTools.resetGuest (db, guestFound)
    respond.advertisment (toNum)
  }
  search ('tracks', trackObjID, db, function (trackDocFound){
    if (trackDocFound){
      respond.requestedAlready (res, guestRequestsLeft, trackDocFound.numRequests)
      db.collection('tracks').updateOne(trackDocFound, updateTemplate.tracksReqd, updateResponseHandler)
    }else{        
      respond.newRequest (res, guestRequestsLeft)
      db.collection('tracks').insertOne(insertTemplate.track(trackID), insertResponseHandler)
    }
  })
  addSongToPlaylist (host, trackID, toNum, db)
  db.collection('guests').updateOne(guestFound, decrementGuest, updateResponseHandler)
}

function addSongToPlaylist (host, trackID, toNum, db){
  search (host, query.findHost (host), db, function (found){
    var playlistID = found.playlistID
    var access_token = found.access_token
    request.post(SpotifyPlaylistJSON.addSongToPlaylist (host, playlistID, trackID, access_token), function(error, response, body) {
      console.log ('body: '+body)
      if (error){
        responseBody = ('there was an error adding ' +trackTitle+ ' to the playlist, will provide more usefull erroror messages in the future')
      }else{
        responseBody = 'your song has been added to the playlist'
      }
      respond.songAdded (toNum, responseBody)
    })
  })
}

module.exports = {
  incoming: incoming,
  requestConfirmed: requestConfirmed,
  searchRequest: searchRequest
}
