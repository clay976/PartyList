
//node modules

//my modules
var databaseHostTools = require ('../../database/hostTools')

var SpotifyWebApi = require('spotify-web-api-node');
var credentials = {
  clientId : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://104.131.215.55:80/callback'
};
var spotifyApi = new SpotifyWebApi(credentials);

// makes a request to the spotify API to retrieve
// the access and refresh tokens for the user
// preps them in to an "options" object to
// make another call for host info
function homepage (req, res) {
  spotifyApi.authorizationCodeGrant(req.query.code)
  .then (function (data){
    setTokensAndGetHostInfo(data)
  })
  .then (function (data){
    databaseHostTools.setHomePageAndSaveHost(data)
  })
  .then (function (host){
    res.redirect (host.homePage)
  })
  .catch (function (err){
    res.status(400).json ('error loggin in: '+err)
  })
}

function setTokensAndGetHostInfo (data) {
  spotifyApi.setAccessToken(data.body['access_token'])
  spotifyApi.setRefreshToken(data.body['refresh_token'])
  return spotifyApi.getMe()
}

/*
function explicitFilter (req, res, db){
  var hostInfo = validateHost (req.body.host)
  hostInfo.then (model.Host.findOneAndUpdate({ 'hostID' : hostInfo.host }, { $set: {'playlistID' : req.body.explicit}}).exec())
  .then (res.status(200).json ('hostInfo.homePage'))  
  .catch (function(err) {
    res.status(err.status).json('failed to set explicit filter, '+ err) fixed option: filter out genres next: go to sleep with girlfriend (all actively playing paties: katya), requested songs: sleep, songs requested: sleep
  })
}
*/

//exports for external modules to use.
module.exports = {
  homepage: homepage
}