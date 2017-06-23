var model         = require ('./models')
var JSONtemplate  = require ('./JSONtemps')

function setTrackAddedToPlaylist (guestObject){
  return new Promise (function (fulfill, reject){
    var query   = {$and: [{ 'trackID' : guestObject.track.trackID}, {'hostID' : guestObject.host.hostID}]}
    var update  = {$set: { addedPlaylist: true}}

    model.Track.findOneAndUpdate(query, update).exec()
    .then (function (track){
      fulfill (guestObject)
    })
    .catch (function (err){
      reject (err)
    })
  })
}

function incrementSongsRequestsInDatabase (guestObject){
  return new Promise (function (fulfill, reject){
    var query   = {$and: [{ 'trackID' : guestObject.track.trackID}, {'hostID' : guestObject.host.hostID}]}
    var update  = {$inc: { numRequests: 1}}
    
    model.Track.findOneAndUpdate(query, update)
    .then (function (track){
      fulfill (guestObject)
    })
    .catch (function (err){
      reject (err)
    })
  })
}

function incrementOrAddSongInDatabase (guestObject){
  return new Promise (function (fulfill, reject){
    for (var index = 0; index < 4; index ++){
      var query = {$and: [{ 'trackID' : guestObject.tracks[index].trackID}, {'hostID' : guestObject.guest.hostID}]}
      model.Track.findOne (query)
      .then (function (track){
        if (track) {
          var update = {$inc: { foundAmount: 1}}
          return model.Track.findOneAndUpdate(query, update).exec()
        }else{
          var update  = JSONtemplate.Track (guestObject.guest.hostID, guestObject.tracks[index].trackID, guestObject.tracks[index].name, guestObject.tracks[index].artist, guestObject.tracks[index].explicit, guestObject.tracks[index].yearReleased)
          return model.Track.findOneAndUpdate(query, update, {upsert : true}).exec()
        }
      })
      .then (function (track){
        if (track) {
          guestObject.track[index] = track
          fulfill (guestObject)
        }else{
          fulfill (guestObject)
        }
      })
      .catch (function (err){
        reject (err)
      })
    }
  })
}

function searchDatabaseForTrack (guestObject){
  return new Promise (function (fulfill, reject){
    var query = {$and: [{ 'trackID' : guestObject.guest.currentTrack.trackID}, {'hostID' : guestObject.host.hostID}]}

    model.Track.findOne(query)
    .then (function (databaseTrack){
      guestObject.track = databaseTrack
      fulfill (guestObject)
    })
    .catch (function (err){
      reject (err)
    })
  })
}

module.exports = {
  setTrackAddedToPlaylist           : setTrackAddedToPlaylist,
  incrementSongsRequestsInDatabase  : incrementSongsRequestsInDatabase,
  incrementOrAddSongInDatabase      : incrementOrAddSongInDatabase,
  searchDatabaseForTrack            : searchDatabaseForTrack
}