var validateHost              = require ('database/host/validate')
var setNewPlaylistHomePage    = require ('database/host/setNewPlaylistHomePage')
var updatehost                = require ('database/host/update')

var model             = require ('database/models')

var updateLatestPlaylistInfo  = require ('services/spotify/playlist/tools/updateLatestPlaylistInfo')
var getHostPlaylists          = require ('services/spotify/account/tools/getHostPlaylists')

var errorHandler              = require ('services/errorHandling/errorHandler')


module.exports = function setLatestPlaylist (host, res){
  validateHost (host)
  .then (getHostPlaylists)
  .then (updateLatestPlaylistInfo)
  .then (setNewPlaylistHomePage)
  .then (async function (requestObject){
    let tracks = await model.Track.find ({'hostID' : requestObject.databaseHost.hostID})
    var promises = tracks.map (async track => {
      track.addedPlaylist = false
      track.save()
      return
    }
    let resolution = await Promise.all(promises)
    return requestObject
  })
  .then (updatehost)
  .then (function (update){
    res.redirect (host.databaseHost.homePage)
  })
  .catch (function (err){
    errorHandler (res, err)
  })
}