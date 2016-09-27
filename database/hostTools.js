var SpotifyWebApi = require('spotify-web-api-node');
var credentials = {
  clientId : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://104.131.215.55:80/callback'
};
var spotifyApi = new SpotifyWebApi(credentials);
var querystring = require('querystring')

var upsertTemplate = require ('./upsert/JSONtemps')
var model = require ('../../database/models')

function setHomePageAndSaveHost(hostInfo){
  var access_token = spotifyApi.getAccessToken
  var refresh_token = spotifyApi.getRefreshToken
  var homePage = '/#' +querystring.stringify({'access_token': access_token,'refresh_token':refresh_token})
  return model.Host.findOneAndUpdate({'hostID': hostInfo.body.id}, upsertTemplate.Host (hostInfo.body.id, access_token, refresh_token, homePage), {upsert:true}).exec()
}

function validateHost (host){
  model.Host.findOne({ 'hostID' : host }).exec()
  .then (function (hostInfo){
    if (hostInfo){
      fulfill (hostInfo) 
    }else{
      reject ("validation error: could not find this host in our database, You must log in to continue")
    }
  })
  .catch (function(err) {
    reject ("mongo error: "+ err)
  })
}

module.exports = {
  setHomePageAndSaveHost: setHomePageAndSaveHost,
  validateHost: validateHost
}