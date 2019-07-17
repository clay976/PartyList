module.exports = function getSpotifyRefreshToken (host){
	model.Host.findOne({ 'hostID' : 'clay976' }).exec()
    .then (function (hostInfo){
      databaseHostTools.spotifyApi.setRefreshToken(hostInfo.refresh_token)
      databaseHostTools.spotifyApi.refreshAccessToken()
      .then(function(data) {
        databaseHostTools.spotifyApi.setAccessToken(data.body.access_token)
        console.log (hostInfo)
        model.Host.findOneAndUpdate({'hostID': 'clay976'}, JSONtemplate.Host ('clay976', data.body.access_token, hostInfo.refresh_token, hostInfo.homePage)).exec()
        .then(function(update) {
          console.log ('getting refresh token successful')
        })
        .catch (function (err){
          console.log (err)
        })
      })
      .catch (function (err){
        console.log ('error getting token: '+ err)
      })
    })
    .catch (function (err){
      console.log (err)
    })
}