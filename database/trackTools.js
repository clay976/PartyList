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
    var q1 = {$and: [{ 'trackID' : guestObject.tracks[0].trackID}, {'hostID' : guestObject.guest.hostID}]}
    var q2 = {$and: [{ 'trackID' : guestObject.tracks[1].trackID}, {'hostID' : guestObject.guest.hostID}]}
    var q3 = {$and: [{ 'trackID' : guestObject.tracks[2].trackID}, {'hostID' : guestObject.guest.hostID}]}
    var q4 = {$and: [{ 'trackID' : guestObject.tracks[3].trackID}, {'hostID' : guestObject.guest.hostID}]}
    
    var t1 = model.Track.findOne (q1)
    var t2 = model.Track.findOne (q2)
    var t3 = model.Track.findOne (q3)
    var t4 = model.Track.findOne (q4)

    Promise.all([t1, t2, t3, t4]).then(function (tracks){
      var u1 = updateOrInsert (guestObject, tracks[0], q1, 0)
      var u2 = updateOrInsert (guestObject, tracks[1], q2, 1)
      var u3 = updateOrInsert (guestObject, tracks[2], q3, 2)
      var u4 = updateOrInsert (guestObject, tracks[3], q4, 3)

      Promise.all([u1, u2, u3, u4]).then(function (updates){
        guestObject.tracks[0] = updates[0]
        guestObject.tracks[1] = updates[1]
        guestObject.tracks[2] = updates[2]
        guestObject.tracks[3] = updates[3]
        fulfill (guestObject)
      })
      .catch (function (err){
        reject (err)
      })
    })
    .catch (function (err){
      reject (err)
    })
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

function updateOrInsert (guestObject, track, q, index){
  return new Promise (function (fulfill, reject){
    if (track) {
      var update = {$inc: { foundAmount: 1}}
      fulfill (model.Track.findOneAndUpdate(q, update).exec())
    }else{
      var update  = JSONtemplate.Track (guestObject.guest.hostID, guestObject.tracks[index].trackID, guestObject.tracks[index].name, guestObject.tracks[index].artist, guestObject.tracks[index].explicit, guestObject.tracks[index].yearReleased)
      fulfill (model.Track.findOneAndUpdate(q, update, {upsert : true}).exec())
    }
  })
}


module.exports = {
  setTrackAddedToPlaylist           : setTrackAddedToPlaylist,
  incrementSongsRequestsInDatabase  : incrementSongsRequestsInDatabase,
  incrementOrAddSongInDatabase      : incrementOrAddSongInDatabase,
  searchDatabaseForTrack            : searchDatabaseForTrack
}