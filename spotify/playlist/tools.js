//my modules
var hostAcountTools = require ('../../database/hostTools')
var playlistTemplate = require ('./JSONtemps')
var model = require ('../../database/models')

//TODO: add comments
function createPlaylist (req, res, db){
  console.log (req.body)
  hostAcountTools.validateHost (req.body.hostID)
  .then (function (hostInfo){
    return validatePlaylistInput(hostInfo, req.body.playName)
  })
  .then (function (validatedInput){
    return (requestSpotifyPlaylistCreation(validatedInput))
  })     
  .then (function(createdPlaylist){
    return model.Host.findOneAndUpdate({ 'hostID' : createdPlaylist.HostID }, { $set: {'playlistID' : createdPlaylist.playlistData.body['id']}}).exec()
  })
  .then (function (updated){
    res.status(200).json ('playlist was created successfully')
  })
  .catch (function(err) {
    res.status(400).json ('error creating playlist: '+ err)
  })
}

//TODO: add comments
 function setLatestPlaylist (req, res, db){
  hostAcountTools.validateHost (req.body.host)
  .then (function (hostInfo){
    return hostAcountTools.spotifyApi.getUserPlaylists(hostInfo.hostID)
  })
  .then (function(data){
    return playlistTemplate.userPlaylists (req.body.host, data.body.items, data.body.total)
  })
  .then (function (playlistInfo){
    console.log (playlistInfo)
    return model.Host.findOneAndUpdate({ 'hostID' : playlistInfo.playlists[0].owner }, { $set: {'playlistID' : playlistInfo.playlists[0].id, 'playlistName' : playlistInfo.playlists[0].name}}).exec()
  })
  .then (function (update){
    console.log (update)
    res.status(200).json ('playlist successfully set to latest playlist')
  })
  .catch (function (err){
    res.status(400).json('error setting latest playlist: '+ err)
  })
}

// //TODO: add comments
function findAllPlaylists (req, res, db){
  hostAcountTools.validateHost (req.body.host)
  .then (function (hostInfo){
    return hostAcountTools.spotifyApi.getUserPlaylists(hostInfo.hostID)
  })
  .then (function(data){
    return playlistTemplate.userPlaylists (req.body.host, data.body.items, data.body.total)
  })
  .then (function (playlistInfo){
    return res.status(200).json (playlistInfo)
  })
  .catch (function (err){
    res.status(400).json ('error retriving user\'s playlists: '+err)
  })
}


function setSpecificPlaylist (req, res, db){
  hostAcountTools.validateHost (req.body.host)
  .then (function (hostInfo){
    return validatePlaylistInput(hostInfo, req.body.playlistID)
  })
  .then (function (validatedInput){
    return validatePlaylistOwnership (validatedInput)
  })
  .then (function (validRequest){
    return (model.Host.findOneAndUpdate({ 'hostID' : validRequest.HostID }, { $set: {'playlistID' : validRequest.playlistID}}).exec())
  })
  .then (function (updated){
    res.status(200).json ('playlist has been set successfully')
  })
  .catch (function(err) {
    res.status(400).json ('error setting playlist: '+ err)
  })
}

function validatePlaylistOwnership (data){
  return new Promise (function (fulfill, reject){
    hostAcountTools.spotifyApi.getPlaylist(data.hostID, data.playName)
    .then (function(playlist){
      fulfill ({
        'hostID' : data.hostID,
        'playlistID' : playlist.id
      })
    })
    .catch (function (err){
      reject ('spotify error: you either do not own that playlist or it does not exist, '+ err)
    })
  })
}

function validatePlaylistInput (hostInfo, playName) {
  //TOD: add additional validation for things like spotify not allowing special characters in playlist names
  return new Promise (function (fulfill, reject){
    if (playName){
      fulfill ({
        'hostID' : hostInfo.hostID,
        'playName' : playName
      })
    }else{
      reject ('we did not recieve playlist information')
    }
  })
}

function requestSpotifyPlaylistCreation (data){
  return new Promise (function (fulfill, reject){
    hostAcountTools.spotifyApi.createPlaylist(data.hostID, data.playName, { public : true })
    .then (function(playlistData){
      fulfill ({
        'hostID'        : data.hostID,
        'playlistData'  : playlistData
      })
    })
    .catch (function (err){
      reject ('spotify error: '+err)
    })
  })
}

module.exports = {
  createPlaylist: createPlaylist,
  setLatestPlaylist: setLatestPlaylist,
  findAllPlaylists: findAllPlaylists,
  setSpecificPlaylist: setSpecificPlaylist
}