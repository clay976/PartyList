//API Wrappers
spotifyApi              = require ('config/SpotifyAPI')

module.exports = function requestSpotifyInfoOnLogin (code){
  return new Promise (function (fulfill, reject){
    var host = {}
    spotifyApi.authorizationCodeGrant(code)
    .then (function (spotifyData){
      spotifyApi.setAccessToken(spotifyData.body['access_token'])
      spotifyApi.setRefreshToken(spotifyData.body['refresh_token'])
      host.access_token = spotifyData.body['access_token']
      host.refresh_token = spotifyData.body['refresh_token']
      return spotifyApi.getMe()
    })
    .then (function (spotifyHost){
      host.spotifyID = spotifyHost.body.id
      host.spotifyHost = spotifyHost.body
      host.displayName = spotifyHost.body.display_name
      fulfill (host)
    })
    .catch (function (err){
      reject (err)
    })
  })
}