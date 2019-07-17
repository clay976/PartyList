var model         = require ('database/models')
var JSONtemplate  = require ('database/JSONtemps')

module.exports = function incrementOrAdd (requestObject){
  return new Promise (function (fulfill, reject){
    var q1 = {$and: [{ 'trackID' : requestObject.tracks[0].trackID}, {'hostID' : requestObject.spotifyID}]}
    var q2 = {$and: [{ 'trackID' : requestObject.tracks[1].trackID}, {'hostID' : requestObject.spotifyID}]}
    var q3 = {$and: [{ 'trackID' : requestObject.tracks[2].trackID}, {'hostID' : requestObject.spotifyID}]}
    var q4 = {$and: [{ 'trackID' : requestObject.tracks[3].trackID}, {'hostID' : requestObject.spotifyID}]}
    
    var t1 = model.Track.findOne (q1)
    var t2 = model.Track.findOne (q2)
    var t3 = model.Track.findOne (q3)
    var t4 = model.Track.findOne (q4)

    Promise.all([t1, t2, t3, t4]).then(function (tracks){
      var u1 = updateOrInsert (requestObject, tracks[0], q1, 0)
      var u2 = updateOrInsert (requestObject, tracks[1], q2, 1)
      var u3 = updateOrInsert (requestObject, tracks[2], q3, 2)
      var u4 = updateOrInsert (requestObject, tracks[3], q4, 3)

      Promise.all([u1, u2, u3, u4]).then(function (updates){
        requestObject.tracks[0] = updates[0]
        requestObject.tracks[1] = updates[1]
        requestObject.tracks[2] = updates[2]
        requestObject.tracks[3] = updates[3]
        fulfill (requestObject)
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

function updateOrInsert (requestObject, track, q, index){
  return new Promise (function (fulfill, reject){
    if (track) {
      var update = {$inc: { foundAmount: 1}}
      model.Track.findOneAndUpdate(q, update).exec()
      .then (function (track){
        fulfill (track)
      })
      .catch (function (err){
        reject (err)
      })
    }else{
      var update  = JSONtemplate.Track (requestObject.spotifyID, requestObject.tracks[index].trackID, requestObject.tracks[index].name, requestObject.tracks[index].artist, requestObject.tracks[index].explicit, requestObject.tracks[index].yearReleased)
      model.Track.findOneAndUpdate(q, update, {upsert : true}).exec()
      .then (function (value){
        fulfill (update)
      })
      .catch (function (err){
        reject (err)
      })
    }
  })
}