//node modules
var request = require('request') // "Request" library
var querystring = require('querystring')
var assert = require('assert')

//my modules
var loginTool = require ('../account/tools')
var hostTools = require ('../../database/hostTools')
var updateTemplate = require ('../../database/update/JSONtemps')
var search = require ('../../database/query/search')
var playlistTemplate = require ('./JSONtemps')
var accountTemplate = require ('../account/JSONtemps')
var model = require ('../../database/models')

var credentials = {
  clientId : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://104.131.215.55:80/callback'
};
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi(credentials);


//TODO: add comments
function createPlaylist (req, res, db){
  var playlistName = req.body.playName
  var hostInfo = loginTool.validateHost (req.body.host)
  .then (function (hostInfo){
    if (playlistName){
      spotifyApi.createPlaylist(hostInfo.hostID, playlistName, { public : true }).then (function(data){
        model.Host.update({ 'hostID' : hostInfo.HostID }, { $set: {'playlistID' : data.body['id']}}).exec()
        .then (res.status(200).redirect (hostInfo.homePage))
      })
    }else{
      res.status(401).redirect ('/')
    }
  })      
  .catch (function (err){
    res.status(400).send ('something went wrong'+err)
  })
}

//TODO: add comments
function setLatestPlaylist (req, res, db){
  var hostInfo = loginTool.validateHost (req.body.host).then (function (hostInfo){
  })
}

//TODO: add comments
function findAllPlaylists (res, db, host){
  hostTools.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){
      requestLatestPlaylist (res, db, host, accountTemplate.authForAccount (host, docFound.access_token), docFound, updatePlaylist)
    }else{
      loginTool.loginRedirect (res, 401, ' a user with invalid tokens tried to find a playlist')
    }  
  })
}

module.exports = {
  createPlaylist: createPlaylist,
  setLatestPlaylist: setLatestPlaylist,
  findAllPlaylists: findAllPlaylists
}