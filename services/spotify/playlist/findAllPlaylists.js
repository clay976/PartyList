var validateHost              = require ('database/host/validate')
var getHostPlaylists          = require ('services/spotify/account/tools/getHostPlaylists')

var errorHandler              = require ('services/errorHandling/errorHandler')

// //TODO: add comments
module.exports = function findAllPlaylists (host, res){
  validateHost (host)
  .then (getHostPlaylists)
  .then (function (host){
    res.status(200).json (host.playlists)
  })
  .catch (function (err){
    errorHandler (res, err)
  })
}