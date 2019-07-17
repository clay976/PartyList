//app modules
//Database modules
var model             = require ('database/models')

module.exports = function update (host){
  return new Promise (function (fulfill, reject){
    var update = host.databaseHost
    model.Host.findOneAndUpdate({'hostID': host.spotifyID}, update, {upsert:true}).exec()
    .then (function (update){
      fulfill (host)
    })
    .catch (function (err){
    	reject (err)
    })
  })
}