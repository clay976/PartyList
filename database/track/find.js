var model             = require ('database/models')

module.exports = function find (requestObject){
  return new Promise (function (fulfill, reject){
    var query = {$and: [{ 'trackID' : requestObject.databaseGuest.currentTracks[requestObject.guestMessage - 1].trackID}, {'hostID' : requestObject.databaseHost.hostID}]}
    model.Track.findOne(query)
    .then (function (databaseTrack){
      requestObject.databaseTrack = databaseTrack
      fulfill (requestObject)
    })
    .catch (function (err){
      reject (err)
    })
  })
}