//app modules
//Database modules
var model             = require ('database/models')
var hostTemplate      = require ('database/JSONtemps')

module.exports = function checkForExistingUser (host){
  return new Promise (function (fulfill, reject){
    model.Host.findOne({'hostID': host.spotifyID})
    .then (function (databaseHost){
      if (databaseHost){
        host.databaseHost = databaseHost
        host.databaseHost.access_token = host.access_token
        host.databaseHost.refresh_token = host.refresh_token
      }else{
        host.databaseHost = hostTemplate.Host (host.spotifyID, host.displayName, host.access_token, host.refresh_token, '', '', '')
      } 
      fulfill (host)
    })
    .catch (function (err){
      reject (err)
    })
  })
}