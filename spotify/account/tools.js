
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
var model = require ('../../database/models')
var upsertTemplate = require ('../../database/upsert/JSONtemps')
var querystring = require('querystring')


// makes a request to the spotify API to retrieve
// the access and refresh tokens for the user
// preps them in to an "options" object to
// make another call for host info
function homepage (req, res) {
  var homePage
  spotifyApi.authorizationCodeGrant(req.query.code)
  .then (function (data){
    return setTokensAndGetHostInfo(data)
  })
  .then (function (hostInfo){
    homePage = '/#' +querystring.stringify({'access_token': hostInfo.access_token,'refresh_token':hostInfo.refresh_token})
    return model.Host.findOneAndUpdate({'hostID': hostInfo.spotifyReturn.body.id}, upsertTemplate.Host (hostInfo.spotifyReturn.body.id, hostInfo.access_token, hostInfo.refresh_token, homePage), {upsert:true}).exec()
  })
  .then (function (host){
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