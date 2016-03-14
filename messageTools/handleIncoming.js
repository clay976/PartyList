//node modules
var request = require('request') // "Request" library

// mongo variables
var insert = require ('../databasetools/insert')
var query = require ('../databasetools/querydb')
var update = require ('../databasetools/update')

// message variables
var respond = require ('./responses')
var dbTools = require ('../databasetools/abstractTools')

//they are making a request
    //search spotify
      //send back response of found song
      //search the database for new or already requested
        //send another response with number of requests
  //they are confirming a request that they have made
    //search songlist for the song from their document
  //they are trying to confirm or decline a request they HAVE NOT made

function incoming (res, db, toNum, guestFound, messageBody){
  var trackID = guestFound.currentTrack

  if ((messageBody.toLowerCase() === 'yes' || messageBody.toLowerCase() === 'no') && trackID === ''){
    respond.emptyConfirmation (toNum)
  }else{
    if (messageBody.toLowerCase() === 'yes'){
      requestConfirmed (res, db, toNum, guestFound, trackID)
    }else if (messageBody.toLowerCase() === 'no'){
      respond.declineRequest (toNum)
    }else{
      var options = {
        url: 'https://api.spotify.com/v1/search?q=' +messageBody+ '&type=track&limit=1'
      } 
      searchRequest(res, db, options, guestFound, trackID)
    }
  }
}

function searchRequest(res, db, options, guestFound, trackID){  
  request.get(options, function (error, response, body) {
    if (error) {
      respond.searchError (toNum)
      console.log ('error searching spotify for the song on request')
    }else{
      trackAdd = JSON.parse(body)
      if (trackAdd.tracks.total>0){
        var guestReqObj = update.guestRequest (trackID)
        update.updater ('guests', guestFound, guestReqObj, db, update.responseHandler)
        respond.askConfirmation (res, db, toNum, guestFound)
      }else{
        respond.songNotFound (toNum)
      }
    }
  })
}

function requestConfirmed (res, db, toNum, guestFound, trackID){
  var trackObjID = query.findTrack (trackID)
  var guestRequestsLeft = guestFound.numRequests
  var decrementGuest = update.guestConfirm ()

  if (guestRequestsLeft < 2){
    dbTools.resetGuest (db, guestFound)
    respond.advertisment (toNum)
  }
  query.search ('tracks', trackObjID, db, function (trackDocFound){
    if (trackDocFound){
      var updateObj = update.tracksReqd ()
      var trackRequests = trackDocFound.numRequests
      
      respond.requestedAlready (toNum, guestRequestsLeft, trackRequests)
      update.updater ('tracks', trackDocFound, updateObj, db, update.responseHandler)
    }else{        
      var track2Insert = insert.track (trackID)
      respond.newRequest (toNum, guestRequestsLeft)
      insert.insert ('tracks', track2Insert, db, insert.responseHandler)
    }
  })
  update.updater ('guests', guestFound, decrementGuest, db, update.responseHandler)
}

module.exports = {
  incoming: incoming,
  requestConfirmed: requestConfirmed,
  searchRequest: searchRequest
}

//this code needs to be changed so that it runs when we actually want to add a song to the playlist.
        //right now it is running as soon as the track is found, where that does not allow us to minipulate
        //the amount of requests that a song has!
        /*validateToken.checkToken (host, db, function(tokenValid, docFound){
          playlistID = docFound.playlistID
          //these options create the object to make the spotify request
          var options = {
            url: "https://api.spotify.com/v1/users/" +host+ "/playlists/"+playlistID+ "/tracks",
            body: JSON.stringify({"uris": ["spotify:track:"+trackID]}),
            dataType:'json',
            headers: {
              Authorization: "Bearer " + docFound.access_token,
              "Content-Type": "application/json",
            }
          }
          //this request is actually adds  the song to the playlist
          request.post(options, function(erroror, response, body) {
            if (erroror){
              responseBody = ('there was an erroror adding ' +trackTitle+ ' to the playlist, will provide more usefull erroror messages in the future')
            }else{
              console.log ('adding ' +trackTitle)
              responseBody = (trackTitle+ ' by ' +trackArtist+ ' has been added to the playlist')
            }
            //logging the body of the spotify request will let the dev know if there are errorors connecting to spotify.
            messageObject = messageTool.message (sender, responseBody) 
            twilio.sendMessage(messageObject, function(error, responseData) {
              messageTool.sendMessageCallback (error, responseData)
            })
          console.log (body)
          })
        })*/

