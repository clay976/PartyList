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
  loginTool.validateHost (req.body.host)
  .then (function (hostInfo){
    spotifyApi.setAccessToken(hostInfo.access_token)
    if (req.body.playName){
      spotifyApi.createPlaylist(hostInfo.hostID, req.body.playName, { public : true })
      .then (function(data){
        model.Host.update({ 'hostID' : hostInfo.HostID }, { $set: {'playlistID' : data.body['id']}}).exec()
        .then (res.status(200).redirect (hostInfo.homePage))
      })
    }else res.status(401).redirect (hostInfo.homePage)
  })      
  .catch (function (err){
    res.status(400).send ('something went wrong: '+err)
  })
}

//TODO: add comments
function setLatestPlaylist (req, res, db){
  loginTool.validateHost (req.body.host)
  .then (function (hostInfo){
    spotifyApi.setAccessToken(hostInfo.access_token)
    spotifyApi.getUserPlaylists(hostInfo.hostID)
    .then (function(data){
      model.Host.update({ 'hostID' : hostInfo.HostID }, { $set: {'playlistID' : data.body.items[0].id}}).exec()
      .then (res.status(200).redirect (hostInfo.homePage))
    })
  })
  .catch (function (err){
    res.status(400).send ('something went wrong: '+err)
  })
}

function setSpecificPlaylist (req, res, db){
  loginTool.validateHost (req.body.host)
  .then (function (hostInfo){
  model.Host.update({ 'hostID' : hostInfo.HostID }, { $set: {'playlistID' : req.body.playlistID}}).exec()
    .then (res.status(200).redirect (hostInfo.homePage))
  })
  .catch (function (err){
    res.status(400).send ('something went wrong: '+err)
  })
}

//TODO: add comments
function findAllPlaylists (req, res, db){
  loginTool.validateHost (req.body.host)
  .then (function (hostInfo){
    spotifyApi.setAccessToken(hostInfo.access_token)
    spotifyApi.getUserPlaylists(hostInfo.hostID)
    .then (function(data){
      console.log (data.body)
      var playlists = data.body.items
      (res.status(200).send ('playlists: '+playlists))
    })
  })
  .catch (function (err){
    res.status(400).send ('something went wrong: '+err)
  })
}

module.exports = {
  createPlaylist: createPlaylist,
  setLatestPlaylist: setLatestPlaylist,
  setSpecificPlaylist: setSpecificPlaylist,
  findAllPlaylists: findAllPlaylists
}