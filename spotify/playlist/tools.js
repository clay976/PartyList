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
        .then (res.status(200).json ('playlist was created successfully'))
      })
      .catch (function(err) {
        res.status(502).json ('spotify error: '+ err)
      })
    }else res.status(400).json ('we did not recieve a playlist name')
  })      
  .catch (function (err){
    res.status(401).json('validating host failed: '+ err)
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
      .then (res.status(200).json ('playlist set to '+ data.body.items[0].name))
    })
    .catch (function(err) {
      res.status(502).json ('Spotify error: '+ err)
    })
  })
  .catch (function (err){
    res.status(401).json('validating host failed: '+ err)
  })
}

//TODO: add comments
function findAllPlaylists (req, res, db){
  hostAcountTools.validateHost (req.body.host)
  .then (function (hostInfo){
    spotifyApi.setAccessToken(hostInfo.access_token)
    spotifyApi.getUserPlaylists(hostInfo.hostID)
    .then (function(data){
      var playJSON = playlistTemplate.userPlaylists (hostInfo.hostID, data.body.items, data.body.total)
      res.status(200).json (playJSON)
    })
    .catch (function(err) {
      res.status(500).json ('spotify error: '+ err)
    })
  })
  .catch (function (err){
    res.status(401).json ('validating host failed: '+err)
  })
}


function setSpecificPlaylist (req, res, db){
  hostAcountTools.validateHost (req.body.host)
  .then (function (hostInfo){
    model.Host.findOneAndUpdate({ 'hostID' : hostInfo.HostID }, { $set: {'playlistID' : req.body.playlistID}}).exec()
    .then (res.status(200).json ('playlist has been set successfully'))
    .catch (function(err) {
      res.status(403).json ('Something went wrong: '+ err)
    })
  })
  .catch (function (err){
    res.status(401).json ('validating host failed: '+err)
  })
}

module.exports = {
  createPlaylist: createPlaylist,
  setLatestPlaylist: setLatestPlaylist,
  findAllPlaylists: findAllPlaylists,
  setSpecificPlaylist: setSpecificPlaylist
}