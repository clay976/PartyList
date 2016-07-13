//node modules
var request = require('request') // "Request" library

// mongo variables
var insert = require ('../databasetools/insert')
var query = require ('../databasetools/querydb')
var update = require ('../databasetools/update')

// message variables
var respond = require ('./responses')
var dbTools = require ('../databasetools/abstractTools')

//my modules
var makeJSON = require ('../JSONobjects/makeJSON')

function incoming (res, db, toNum, guestFound, messageBody){
  var trackID = guestFound.currentTrack
  if ((messageBody.toLowerCase() === 'yes' || messageBody.toLowerCase() === 'no') && trackID === ''){
    respond.emptyConfirmation (res)
  }else{
    if (messageBody.toLowerCase() === 'yes'){
      requestConfirmed (res, db, toNum, guestFound, trackID)
    }else if (messageBody.toLowerCase() === 'no'){
      respond.declineRequest (res)
      update.updater ('guests', guestFound, update.guestRequest (''), db, update.responseHandler)
    }else{
      searchRequest(res, db, toNum, {url: 'https://api.spotify.com/v1/search?q=' +messageBody+ '&type=track&limit=1'}, guestFound)
    }
  }
}

function searchRequest(res, db, toNum, options, guestFound){  
  request.get(options, function (error, response, body) {
    if (error) {
      respond.searchError (res)
      console.log ('error searching spotify for the song on request')
    }else{
      trackAdd = JSON.parse(body)
      if (trackAdd.tracks.total>0){
        var guestReqObj = update.guestRequest (trackAdd.tracks.items[0].id)
        update.updater ('guests', guestFound, guestReqObj, db, update.responseHandler)
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
  query.search ('tracks', trackObjID, db, function (trackDocFound){
    if (trackDocFound){
      var updateObj = update.tracksReqd ()
      var trackRequests = trackDocFound.numRequests
      respond.requestedAlready (res, guestRequestsLeft, trackRequests)
      update.updater ('tracks', trackDocFound, updateObj, db, update.responseHandler)
    }else{        
      var track2Insert = insert.track (trackID)
      respond.newRequest (res, guestRequestsLeft)
      insert.insert ('tracks', track2Insert, db, insert.responseHandler)
    }
  })
  addSongToPlaylist (host, trackID, toNum)
  update.updater ('guests', guestFound, decrementGuest, db, update.responseHandler)
}

function addSongToPlaylist (host, trackID, toNum){
  var docuFound = query.findHost (host)
  var playlistID = docuFound.playlistID
  var access_token = docuFound.access_token

  console.log ('attempting to add song to playlist')
  request.post(makeJSON.addSongToPlaylist (host, playlistID, trackID, access_token), function(error, response, body) {
    console.log ('error: 'error)
    console.log ('response: 'response)
    console.log ('body: 'body)
    if (error){
      responseBody = ('there was an error adding ' +trackTitle+ ' to the playlist, will provide more usefull erroror messages in the future')
    }else{
      responseBody = 'your song has been added to the playlist'
    }
    respond.songAdded (toNum, responseBody)
  })
}

module.exports = {
  incoming: incoming,
  requestConfirmed: requestConfirmed,
  searchRequest: searchRequest
}
