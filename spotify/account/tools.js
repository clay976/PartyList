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
var playlistTemplate  = require ('../playlist/JSONtemps')


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
    return setPlaylistOnLogin (hostInfo)
  })
  .then (function (hostInfo){
    var homePage = '/loggedIn.html#' +querystring.stringify({'hostID':hostInfo.host.id, 'playlistID': hostInfo.playlist.id})
    
    model.Host.findOneAndUpdate({'hostID': hostInfo.host.id}, JSONtemplate.Host (hostInfo.host.id, hostInfo.access_token, hostInfo.refresh_token, homePage, hostInfo.playlist.id, hostInfo.playlist.name), {upsert:true}).exec()
    return (homePage)
  })
  .then (function (homePage){
    res.redirect (homePage)
  })
  .catch (function (err){
    console.log (err.stack)
    return res.status(400).json ('error loggin in: '+err)
  })
}

function setTokensAndGetHostInfo (data) {
  return new Promise (function (fulfill, reject){
    spotifyApi.setAccessToken(data.body['access_token'])
    spotifyApi.getMe()
    .then (function (spotifyReturn) {
      console.log (spotifyReturn.body)
      fulfill  ({ 
        "host"          : spotifyReturn.body,
        "access_token"  : data.body['access_token'],
        "refresh_token" : data.body['refresh_token']
      })
    })
    .catch (function(err) {
      reject ("spotify error: "+ err)
    })
  })
}

function setPlaylistOnLogin (hostInfo){
  return new Promise (function (fulfill, reject){
    spotifyApi.getUserPlaylists(hostInfo.host.id)
    .then (function (playlists){
      console.log (playlists)
      return playlistTemplate.userPlaylists (hostInfo.host.id, playlists.body.items, playlists.body.total)
    })
    .then (function (playlists){
      console.log (playlists)
    })
    .then (function (){
      return 
    })
    .catch (function (err){
      reject (err)
    })
  })
}


//exports for external modules to use.
module.exports = {
  homepage: homepage
}