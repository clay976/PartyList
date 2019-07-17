var spotifyApi          = require ('config/SpotifyAPI')
var updateHostinDB      = require ('database/host/update')
var model               = require ('database/models')

module.exports = function refreshTokens (host){
  return new Promise (function (fulfill, reject){
    console.log ('gettings tokens')
    spotifyApi.setRefreshToken(host.databaseHost.refresh_token)
    spotifyApi.refreshAccessToken()
    .then(function(spotifyReturn) {
      host.databaseHost.access_token = spotifyReturn.body.access_token
      fulfill (host)
    })
    .catch (function (err){
      console.log (err)
    })
  })
}