var validateHost              = require ('database/host/validate')
var setNewPlaylistHomePage    = require ('database/host/setNewPlaylistHomePage')
var updatehost                = require ('database/host/update')

var validatePlaylistOwnership = require ('services/spotify/playlist/tools/validatePlaylistOwnership')

var errorHandler              = require ('services/errorHandling/errorHandler')

module.exports = function setSpecificPlaylist (host, res){
  validateHost (host)
  .then (validatePlaylistOwnership)
  .then (setNewPlaylistHomePage)
  .then (updatehost)
  .then (function (host){
  	res.redirect (host.databaseHost.homePage)
  })
  .catch (function(err) {
    errorHandler (res, err)
  })
}