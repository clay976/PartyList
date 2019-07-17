//API Wrappers
spotifyApi              = require ('config/SpotifyAPI')

//Calls spotify API with Spotify username, and the playlist ID to verify that this user can edit the playlist.
module.exports = function validatePlaylistOwnership (host){
  return new Promise (function (fulfill, reject){
  	playlistID = host.playlistID
    spotifyApi.getPlaylist(playlistID)
    .then (function(playlist){
      if (host.spotifyID == playlist.body.owner.id){
        host.newSpotifyPlaylist = playlist.body
        fulfill (host)
      } 
      else reject ('It seems that you do not own that playlist. Please select a playlist you own.')
    })
    .catch (function (err){
      reject ('spotify error: There was an error retriving playlist information, '+ err)
    })
  })
}