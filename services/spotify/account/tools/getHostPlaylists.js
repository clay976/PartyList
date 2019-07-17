//node modules
var playlistTemplate  = require ('services/spotify/playlist/JSONtemps')

//API Wrappers
spotifyApi              = require ('config/SpotifyAPI')

module.exports = function getHostPlaylists (host){
  return new Promise (function (fulfill, reject){
    spotifyApi.getUserPlaylists(host.spotifyID)
    .then (function (playlists){
      return playlistTemplate.userPlaylists (host.spotifyID, playlists.body.items, playlists.body.total)
    })
    .then (function (playlists){
      host.playlists = playlists
      fulfill (host)
    })
    .catch (function (err){
      reject (err)
    })
  })
}