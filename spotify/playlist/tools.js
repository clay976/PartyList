//my modules
var hostAcountTools = require ('../account/tools')
var playlistTemplate = require ('./JSONtemps')
var model = require ('../../database/models')

//node modules
var credentials = {
  clientId : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://104.131.215.55:80/callback'
};
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi(credentials);


//TODO: add comments
function createPlaylist (req, res, db){
  hostAcountTools.validateHost (req.body.host)
  .then (function (hostInfo){
    spotifyApi.setAccessToken(hostInfo.access_token)
    if (req.body.playName){
      spotifyApi.createPlaylist(hostInfo.hostID, req.body.playName, { public : true })
      .then (function(data){
        model.Host.findOneAndUpdate({ 'hostID' : hostInfo.HostID }, { $set: {'playlistID' : data.body['id']}}).exec()
        .then (res.status(200).redirect (hostInfo.homePage))
      })
    }else res.status(401).redirect (hostInfo.homePage)
  })      
  .catch (function (err){
    res.status(400).send ('something went wrong: '+err.stack)
  })
}

//TODO: add comments
function setLatestPlaylist (req, res, db){
  hostAcountTools.validateHost (req.body.host)
  .then (function (hostInfo){
    spotifyApi.setAccessToken(hostInfo.access_token)
    spotifyApi.getUserPlaylists(hostInfo.hostID)
    .then (function(data){
      model.Host.findOneAndUpdate({ 'hostID' : hostInfo.HostID }, { $set: {'playlistID' : data.body.items[0].id}}).exec()
      .then (res.status(200).redirect (hostInfo.homePage))
    })
  })
  .catch (function (err){
    res.status(400).send ('something went wrong: '+err.stack)
  })
}

function setSpecificPlaylist (req, res, db){
  hostAcountTools.validateHost (req.body.host)
  .then (function (hostInfo){
    model.Host.findOneAndUpdate({ 'hostID' : hostInfo.HostID }, { $set: {'playlistID' : req.body.playlistID}}).exec()
    .then (res.status(200).redirect (hostInfo.homePage))
  })
  .catch (function (err){
    res.status(400).send ('something went wrong: '+err)
  })
}

//TODO: add comments
function findAllPlaylists (req, res, db){
  hostAcountTools.validateHost (req.body.host)
  .then (function (hostInfo){
    spotifyApi.setAccessToken(hostInfo.access_token)
    spotifyApi.getUserPlaylists(hostInfo.hostID)
    .then (function(data){
      var playlistJSON = playlistTemplate.userPlaylists (hostInfo.hostID, data.body.items, data.body.total)
      console.log (playlistJSON)
      (res.status(200).json (playlistJSON))
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