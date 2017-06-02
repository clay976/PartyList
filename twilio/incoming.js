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
var guestObj        = require ('./JSONtemps')

/*
var dataBaseTrack   = model.Track.findOne({$and: [{ 'trackID' : guestReqObject.guest.currentTrack.trackID}, {'hostID' : guestReqObject.guest.hostID}]}).exec()
var hostInfo        = model.Host.findOne({ 'hostID' : guestInfo.hostID}).exec()
update              = guestObject.clearGuestSong (-1, guestInfo.currentTrack.trackID)
var spotifyTrack    = hostAcountTools.spotifyApi.searchTracks (guestReqObject.guest.lastMessage, { limit : 1 })
*/

//message incoming
function HandleIncomingMessage (req, res, db){
  var guestNum      = req.body.From
  var guestMessage  = req.body.Body.toLowerCase().trim()
  var resp          = new twilio.TwimlResponse();
  res.writeHead (200, {'Content-Type': 'text/xml'});
  
  //make sure the guest is actually a guest of a party.
  if (guestMessage === 'yes'){ 
    var trackID       = guestInfo.currentTrack.trackID
    var hostInfo      = searchDatabaseForHost (hostID)
    var databaseTrack = searchDatabaseForTrack (hostID, trackID)
  
  }else{
    validateGuest (guestNum, guestMessage)
    .then (function (guestObject){
      return searchSpotify (guestObject)
    })
    .then (function (guestObject){
      return checkForPreviousRequests (guestObject)
    })
    .then (function(spotifyTrack){
      return incrementOrAddSongInDatabase (guestObject)
    })
    .then (function (){
      return setGuestCurrentTrack (guestObject)
    })
    .then (function (guestObject){
      return addResponse.askToConfirm (guestObject)
    })
    .then (function (response){
      resp.message (response)
      res.end(resp.toString())
    })
    .catch (function (err){
      console.log (err)
      console.log (err.stack)
    })
  }
}

//find the guest in our database by their phone number
//if their number is not found or if they are not apart of anyone's parties currently. They are told they are not a guest.
function validateGuest (guestNumber, message){
  return new Promise (function (fulfill, reject){
    var error = 'error searching for guest in our database'
    model.Guest.findOne({ 'phoneNum' : guestNumber })
    .then (function (guestInfo){
      if (guestInfo){
        if (guestInfo.hostID){
          var guestObject = guestObj.guest (guestInfo)
          guestObject.guest.lastMessage = message
          fulfill (guestObject) 
        }else reject (response.notGuest)
      }else reject (response.notGuest)
    })
    .catch (function (err){
      reject (error)
    })
  })
}

function searchSpotify (guestObject){
  var query = guestObject.guest.lastMessage

  return new Promise (function (fulfill, reject){
    var error = 'error searching spotify for song'
    hostAcountTools.spotifyApi.searchTracks (query, { limit : 1 })//search spotify for a track based on the message we got from the
    .then (function (spotifyTrack){
      if (spotifyTrack.body.tracks.total != 0){ //we found a track on spotify matching the guest message)
        guestObject.track = {
          'trackID'     : spotifyTrack.body.tracks.items[0].id,
          'name'        : spotifyTrack.body.tracks.items[0].name,
          'artist'      : spotifyTrack.body.tracks.items[0].artists[0].name,
          'numRequests' : 0
        }
        fulfill (guestObject)
      }else{ // we did not find a track matching the guests search request so we reject immediatley and respond to them
        reject (addResponse.songNotFound)
      }
    })
    .catch (function (err){
      reject (error)
    })
  })
}

function searchDatabaseForHost (hostID){
  return new Promise (function (fulfill, reject){
  var query     = {'hostID' : guestInfo.hostID}
  var error     = 'error searching for host in database'

  model.Host.findOne(query).exec()
  .then (function (host){
    fulfill (host)
  })
  .catch (function (err){
      reject (error)
    })
  }) 
}

function checkForPreviousRequests (guestObject){
  return new Promise (function (fulfill, reject){
    var error = 'The guest has already requested this song'
    for (var i = 0; i < guestObject.guest.prevRequests.length; i++){
      if (guestObject.track.trackID === prevRequests[i]){
        //we found that the guest has already requested the same track they searched so reject with that message right away
        reject (true)
      }
    }
    //this is a new request from this guest so continue on the function chain
    fulfill (guestObject)
  })
}

function setGuestCurrentTrack (guestObject){
  return new Promise (function (fulfill, reject){
    var track   = JSONtemplate.setGuestTrack (guestObject.track.trackID, guestObject.track.name, guestObject.track.artist, guestObject.track.numRequests)
    var query   = {'phoneNum' : guestObject.guest.phoneNum}
    var update  = {$set : {'currentTrack' : track}}
    var success = 'successfully set the guest\'s current track in our database'
    var error   = 'error setting the guest\'s current track in our database'

    model.Guest.findOneAndUpdate(query, update).exec()
    .then (function (guest){
      fulfill (guestObject)
    })
    .catch (function (err){
      reject (error)
    })
  })
}

function searchDatabaseForTrack (hostID, trackID){
  return new Promise (function (fulfill, reject){
    var query = {$and: [{ 'trackID' : trackID}, {'hostID' : hostID}]}
    var error = 'error searching for song in our database'

    model.Track.findOne(query)
    .then (function (databaseTrack){
      fulfill (databaseTrack)
    })
    .catch (function (err){
      reject (error)
    })
  })
}

// the guest has confirmed the last song that they sent to us so we will see about adding it to the playlist.
function clearAndAddGuestPreviousRequestInDatabase (guestNum, trackID){
  return new Promise (function (fulfill, reject){
    var query   = { 'phoneNum' : guestNum}
    var update  = guestObj.clearGuestSong (-1, trackID)
    var success = guestNum + ' current track successfully cleared'
    var error   = 'there was an error clearing ' +guestNum+ '\'s current song'

    model.Guest.findOneAndUpdate(query, update).exec()
    .then (function (guest){
      fulfill (success)
    })
    .catch (function (err){
      reject (error)
    })
  })
}

function incrementOrAddSongInDatabase (guestObject){
  return new Promise (function (fulfill, reject){
    var query = {$and: [{ 'trackID' : guestObject.track.trackID}, {'hostID' : guestObject.guest.hostID}]}
    var error = 'there was an error updating the track\'s number of found times in our database'

    model.Track.findOne (query)
    .then (function (track){
      if (track) {
        var update = {$inc: { foundAmount: 1}}
        return model.Track.findOneAndUpdate(query, update).exec()
      }else{
        var update  = JSONtemplate.Track (guestObject.guest.hostID, guestObject.track.trackID, guestObject.track.name, guestObject.track.artist)
        return model.Track.findOneAndUpdate(query, update, {upsert : true}).exec()
      }
    })
    .then (function (track){
      if (track) {
        guestObject.track = track
        fulfill (guestObject)
      }else{
        fulfill (guestObject)
      }
    })
    .catch (function (err){
      reject (error)
    })
  })
}

function incrementSongsRequestsInDatabase (hostID, trackID){
  return new Promise (function (fulfill, reject){
    var query   = {$and: [{ 'trackID' : trackID}, {'hostID' : hostID}]}
    var update  = {$inc: { numRequests: 1}}
    var success = trackID + ' requests successfully incremented'
    var error   = 'there was an error updating the track\'s number of requests in our database'
    
    model.Track.findOneAndUpdate(query, update)
    .then (function (track){
      fulfill (success)
    })
    .catch (function (err){
      reject (error)
    })
  })
}

function setTrackAddedToPlaylist (hostID, trackID){
  return new Promise (function (fulfill, reject){
    var query   = {$and: [{ 'trackID' : trackID}, {'hostID' : hostID}]}
    var update  = {$set: { addedPaylist: true}}
    var success = trackID + ' successfully added to playlist in database'
    var error   = 'there was an error updating the track as "on playlist" in our database'
    
    model.Track.findOneAndUpdate(query, update).exec()
    .then (fulfill (success))
    .catch (function (err){
      reject (error)
    })
  })
}

// pulling data from spotify search
//JSONtemplate.setGuestTrack (spotifyTrack.body.tracks.items[0].id, spotifyTrack.body.tracks.items[0].name, spotifyTrack.body.tracks.items[0].artists[0].name)

// respose if the guest has already requested this song
//addResponse.alreadyRequested (track.name, track.artist)

// condition for number of requests to add to playlist
//(track.numRequests === (hostInfo.reqThreshold - 1))

//add track to playlist on spotify
//hostAcountTools.spotifyApi.setAccessToken(access_token)
//hostAcountTools.spotifyApi.addTracksToPlaylist (hostID, playlistID, 'spotify:track:'+trackID)

// response for succesfully adding song to playlist on spotify
//guestObject.response  = addResponse.songConfirmedAndAdded (track.name, track.artist)

// response for succesfully incrementing a songs request
//guestObject.response = addResponse.songConfirmed (trackName, trackArtist, numRequests, reqThreshold)


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
