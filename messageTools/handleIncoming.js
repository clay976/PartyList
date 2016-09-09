//node modules
var request = require('request') // "Request" library

// mongo variables
var search = require ('../database/query/search')
var updateResponseHandler = require ('../database/update/responseHandler')
var updateTemplate = require ('../database/update/JSONtemps')
var insertResponseHandler = require ('../database/insert/responseHandler')
var insertTemplate = require ('../database/insert/JSONtemps')
var searchTemplate = require ('../database/query/JSONtemps')

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
  if (guestFound.numRequests < 1){
    dbTools.resetGuest (db, guestFound)
    respond.advertisment (toNum)
  }
  search.search ('tracks', searchTemplate.findTrack (trackID), db, function (trackDocFound){
    if (trackDocFound){
      respond.requestedAlready (res, guestFound.numRequests, trackDocFound.numRequests)
      db.collection('tracks').updateOne(trackDocFound, updateTemplate.tracksReqd (), updateResponseHandler)
    }else{        
      respond.newRequest (res, guestFound.numRequests)
      db.collection('tracks').insertOne(insertTemplate.track(trackID), insertResponseHandler)
    }
  })
  addSongToPlaylist (guestFound.host, trackID, toNum, db)
  db.collection('guests').updateOne(guestFound, updateTemplate.guestConfirm (), updateResponseHandler)
}

function addSongToPlaylist (host, trackID, toNum, db){
  search.search (host, searchTemplate.findHost (host), db, function (found){
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

module.exports = {
  incoming: incoming,
  requestConfirmed: requestConfirmed,
  searchRequest: searchRequest
}
