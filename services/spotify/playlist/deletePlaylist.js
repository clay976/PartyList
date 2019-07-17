//API Wrappers
spotifyApi              = require ('config/SpotifyAPI')

var validateHost              = require ('database/host/validate')
var setNewPlaylistHomePage    = require ('database/host/setNewPlaylistHomePage')
var updatehost                = require ('database/host/update')

var validateNewPlaylistInput  = require ('services/spotify/playlist/tools/validateNewPlaylistInput')
var requestPlaylistCreation   = require ('services/spotify/playlist/tools/requestPlaylistCreation')

var errorHandler              = require ('services/errorHandling/errorHandler')

//TODO: add comments
module.exports = function deletePlaylist (host, res){
  validateHost (host)
  .then (function (host){
    console.log (host)
    return spotifyApi.unfollowPlaylist (host.playlistID)
  })
  .then (function (host){
    res.status(200).send ('playlist successfully deleted')
  })
  .catch (function(err) {
    errorHandler (res, err)
  })
}