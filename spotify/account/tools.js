//Database modules
var databaseHostTools = require ('../../database/hostTools')
var model             = require ('../../database/models')
var JSONtemplate      = require ('../../database/JSONtemps')

//spotify tools
var playlistTool      = require ('../playlist/tools')
var SpotifyWebApi     = require('spotify-web-api-node');
var credentials       = {
  clientId            : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret        : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri         : 'http://104.131.215.55:80/callback'
}
var spotifyApi        = new SpotifyWebApi(credentials);

//node modules
var querystring       = require('querystring')


// makes a request to the spotify API to retrieve
// the access and refresh tokens for the user
// preps them in to an "options" object to
// make another call for host info
function homepage (req, res) {
  spotifyApi.authorizationCodeGrant(req.query.code)
  .then (function (data){
    return setTokensAndGetHostInfo(data)
  })
  .then (function (hostInfo){
    var homePage = '/#' +querystring.stringify({'access_token': hostInfo.access_token,'refresh_token':hostInfo.refresh_token,'hostID':hostInfo.spotifyReturn.body.id})
    playlistTool.setLatestPlaylist (hostInfo.spotifyReturn.body.id)
    model.Host.findOneAndUpdate({'hostID': hostInfo.spotifyReturn.body.id}, JSONtemplate.Host (hostInfo.spotifyReturn.body.id, hostInfo.access_token, hostInfo.refresh_token, homePage), {upsert:true}).exec()
    return (homePage)
  })
  .then (function (homePage){
    res.redirect (homePage)
  })
  .catch (function (err){
    return res.status(400).json ('error loggin in: '+err)
  })
}

function setTokensAndGetHostInfo (data) {
  return new Promise (function (fulfill, reject){
    spotifyApi.setAccessToken(data.body['access_token'])
    spotifyApi.getMe()
    .then (function (spotifyReturn) {
      fulfill  ({ 
        "spotifyReturn" : spotifyReturn,
        "access_token"  : data.body['access_token'],
        "refresh_token" : data.body['refresh_token']
      })
    })
    .catch (function(err) {
      reject ("spotify error: "+ err)
    })
  })
}

//exports for external modules to use.
module.exports = {
  homepage: homepage
}