//node modules
var querystring       = require ('querystring')

//spotify tools
var validatePlaylistOwnership      = require ('services/spotify/playlist/tools/validatePlaylistOwnership')

module.exports = function finalizeLoginInformation (host){
  return new Promise (function (fulfill, reject){
    if (host.databaseHost.playlistID){
      host.playlistID = host.databaseHost.playlistID
      validatePlaylistOwnership (host)
      .then (function (host){
        host.databaseHost.homePage = '/loggedIn.html#' +querystring.stringify({'hostID':host.spotifyID, 'playlistID': host.databaseHost.playlistID})
        fulfill (host)
      })
      .catch (function (err){
        host.databaseHost.playlistID = host.playlists[0].id
        host.databaseHost.playlistName = host.playlists[0].name
        host.databaseHost.homePage = '/loggedIn.html#' +querystring.stringify({'hostID':host.spotifyID, 'playlistID': host.playlists[0].id})
        fulfill (host)
      })
    }else if (host.playlists[0]){
      host.databaseHost.playlistID = host.playlists[0].id
      host.databaseHost.playlistName = host.playlists[0].name
      host.databaseHost.homePage = '/loggedIn.html#' +querystring.stringify({'hostID':host.spotifyID, 'playlistID': host.playlists[0].id})
      fulfill (host)
    }else{
      host.databaseHost.homePage = '/loggedIn.html#' +querystring.stringify({'hostID':host.spotifyID, 'playlistID':'noplaylist'})
      fulfill (host)
    }
  })
}