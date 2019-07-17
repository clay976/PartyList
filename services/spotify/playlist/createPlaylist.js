var validateHost              = require ('database/host/validate')
var setNewPlaylistHomePage    = require ('database/host/setNewPlaylistHomePage')
var updatehost                = require ('database/host/update')

var validateNewPlaylistInput  = require ('services/spotify/playlist/tools/validateNewPlaylistInput')
var requestPlaylistCreation   = require ('services/spotify/playlist/tools/requestPlaylistCreation')

var errorHandler              = require ('services/errorHandling/errorHandler')

//TODO: add comments
module.exports = function createPlaylist (host, res){
  validateHost (host)
  .then (validateNewPlaylistInput)
  .then (requestPlaylistCreation)
  .then (setNewPlaylistHomePage)
  .then (updatehost)
  .then (function (host){
    res.redirect (host.databaseHost.homePage)
  })
  .catch (function (err){
  	errorHandler (res, err)
  })
}