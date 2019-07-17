//API Wrappers
spotifyApi              = require ('config/SpotifyAPI')

module.exports = function requestPlaylistCreation (host){
  return new Promise (function (fulfill, reject){
    spotifyApi.createPlaylist(host.spotifyID, host.newPlaylistName, { public : true })
    .then (function(playlistData){
      host.newSpotifyPlaylist = playlistData.body
      fulfill (host)
    })
    .catch (function (err){
    	reject (err)
    })
  })
}