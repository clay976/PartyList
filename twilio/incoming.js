//twilio modules
var twilio          = require('twilio')
var sid             = 'AC85573f40ef0c3fb0c5aa58477f61b02e'
var atoken          = 'fcea26b2b0ae541d904ba23e12e2c499'
var client          = require('twilio/lib')(sid, atoken);

//database modules
var hostAcountTools = require ('../database/hostTools')
var guestTools      = require ('../database/guestTools')
var model           = require ('../database/models')
var JSONtemplate    = require ('../database/JSONtemps')

//other templates
var addResponse     = require ('./responses')
var guestObject     = require ('./JSONtemps')

/*
var dataBaseTrack             = model.Track.findOne({$and: [{ 'trackID' : guestReqObject.guest.currentTrack.trackID}, {'hostID' : guestReqObject.guest.hostID}]}).exec()
var hostInfo                  = model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
guestReqObject.guestUpdate    = guestObject.clearGuestSong (-1, guestInfo.currentTrack.trackID)
var spotifyTrack              = hostAcountTools.spotifyApi.searchTracks (guestReqObject.guest.lastMessage, { limit : 1 })
*/

//message incoming
function HandleIncomingMessage (req, res, db){
  console.log ('incoming text')
  console.log ('from: '+ req.body.From+ ', message: '+ req.body.Body)
  var resp = new twilio.TwimlResponse();
  res.writeHead(200, {'Content-Type': 'text/xml'});
  //make sure the guest is actually a guest of a party.
  guestTools.validateGuest (req.body)
  .then (function (guestInfo){
    //check the state of the guest wether they are searching or confirming
    return (checkGuestState (guestInfo))
  })
  .then (function (guestObject){
    //perform the necessary action based on the state like search spotify or take a guest off a mailing list
    return performActionBasedOnState (guestObject)
  })
  .then (function (responseObject){
    return guestTools.updateGuestAndTrackIfNeeded (responseObject)
  })
  .then (function (responseObject){
    console.log ('sending to guest: ' +responseObject.response)
    resp.message (responseObject.response)
    res.end(resp.toString());
  })
  .catch (function (err){
    console.log ('sending error to guest: ' +responseObject.response)
    console.log (err.stack)
    resp.message (err)
    res.end(resp.toString());
  })
}

// Checks to see if a guest is requesting a new track or if they are confirming an already searched track

// Other state checking will be added here for additional options that the guest can send up (things like
// advertising opt outs and stuff)
function checkGuestState (guestInfo){
  return new Promise (function (fulfill, reject){
    var guestObject = JSONtemplate.guest (guestInfo)
    var messageBody = guestInfo.lastMessage
    //guest is confirming the last track that we have for them
    if ((messageBody === 'yes') && (guestInfo.currentTrack.trackID != '')){
      guestObject.state = 'search'
      fulfill (guestObject)
    }
    //guest is searching a new song because we have not matched any other string in their message to our dictionairy
    else{
      guestObject.state = 'confirm'
      fulfill (guestObject)
    }
  })
}

//these actions relate directly to the state of the message that we have received from the guest.
function performActionBasedOnState (guestObject){
  return new Promise (function (fulfill, reject){
    //searching spotify and building a repsonse based on the search request and response from spotify
    if (guestObject.state = 'search'){
      searchSpotify (guestObject)
      .then (searchDatabaseForTrack (guestObject))
      .then (checkForPreviousRequests (guestObject))
      .then (fulfill (guestObject))
      .catch (function (err){
        console.log (err.stack)
        reject (err)
      })
    }
    //guest has confirmed a song so we will use our service to see about adding it to the playlist or whatnot (bumping it up in the queue possibly)
    else{
      fulfill (songConfirmed (guestObject))
    }
  })
}

function searchSpotify (guestObject){
  return new Promise (function (fulfill, reject){
    //search spotify for a track based on the message we got from the
    hostAcountTools.spotifyApi.searchTracks (guestObject.guest.lastMessage, { limit : 1 })
    .then (function (spotifyTrack){
      //we found a track on spotify matching the guest message
      if (tracksFound.body.tracks.total != 0){
        guestObject.spotifyTrack = spotifyTrack
        fulfill (guestObject)
      }
      // we did not find a track matching the guests search request so we reject immediatley and respond to them
      else{
        reject (addResponse.songNotFound)
      }
    })
  })
}

function searchDatabaseForTrack (guestObject){
  return new Promise (function (fulfill, reject){
    model.Track.findOne({$and: [{ 'trackID' : guestObjectspotifyTrack.id}, {'hostID' : guestObject.guest.hostID}]}).exec()
    .then (function (databaseTrack){
      //the track the guest has searched has already been added to the playlist so reject right away and tell them that
      if (databaseTrack && databaseTrack.addedPaylist){
        reject (addResponse.alreadyAdded (title, artist, trackFound.numRequests + 1))
      }
      //this track was found in our database so we are going to log that info (might be useful to know what tracks get searched most)
      if (databaseTrack){
        guestObject.databaseTrack = databaseTrack
        guestObject.trackUpdate = {$inc: { foundAmount: 1}}
        fulfill (guestObject)
      }
      // the track was not found in our database so we are going to add it. That way we can log additional info about it and use it late if it is confirmed
      else{
        guestObject.databaseTrack = JSONtemplate.Track (guestObject.guest.hostID, guestObject.SpotifyTrack.id, guestObject.SpotifyTrack.name, guestObject.SpotifyTrack.artists[0].name)
        model.Track.findOneAndUpdate ({$and: [{ 'trackID' : guestObject.SpotifyTrack.id}, {'hostID' : guestObject.guest.hostID}]}, guestObject.databaseTrack, {upsert:true}).exec()
        fulfill (guestObject)
      }
    })
  })
}

function checkForPreviousRequests (guestObject){
  return new Promise (function (fulfill, reject){
    for (var i = 0; i < guestObject.guest.prevRequests.length; i++){
      if (guestObject.spotifyTrack.id === guestObject.guest.prevRequests[i]){
        //we found that the guest has already requested the same track they searched so reject with that message right away
        reject (addResponse.youAlreadyRequested (title, artist))
      }
    }
    //this is a new request from this guest so continue on the function chain
    guesObject.response = addResponse.askToConfirm (title, artist, trackFound.numRequests)
    fulfill (guestObject)
  })
}

function addTrackToPlaylist (guestReqObject, hostInfo, track){
  hostAcountTools.spotifyApi.setAccessToken(hostInfo.access_token)
  hostAcountTools.spotifyApi.addTracksToPlaylist (guestInfo.hostID, hostInfo.playlistID, 'spotify:track:'+track.trackID)
  guestReqObject.trackUpdate = {$set: { addedPaylist: true}}
  guestReqObject.response    = addResponse.songConfirmedAndAdded (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, track.numRequests)
  return (guestReqObject)
}

function handleTrackDatabaseSearch (values){
  return new Promise (function (fulfill, reject){
    track = values[0]
    hostInfo = values[1]
    // the track was found in our database because someone already searched for it (possibly the person confirming it)
    if (track){
      // the song has met the number of requests to be added to the playlist
      if (track.numRequests === (hostInfo.reqThreshold - 1)) return addTrackToPlaylist (guestReqObject, hostInfo, track)
      // the song has been confirmed but will not be added to the playlist yet
      else{
        guestReqObject.trackUpdate= {$inc: { numRequests: 1}}
        guestReqObject.response   = addResponse.songConfirmed (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, track.numRequests)
        return (guestReqObject)
      }
    // the track is new so the guest will be informed that they have confirmed and it 
    }else{
      guestReqObject.trackUpdate  = {$inc: { numRequests: 1}}
      guestReqObject.response     = addResponse.songConfirmed (guestInfo.currentTrack.name, guestInfo.currentTrack.artist, 0)
      return (guestReqObject)
    }
  })
}

/*else if (messageBody === 'yes' && guestInfo.numRequests < 1){
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
    }*/

module.exports = {
  HandleIncomingMessage: HandleIncomingMessage
}
