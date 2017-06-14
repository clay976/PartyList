//my modules
var hostAcountTools   = require ('../../database/hostTools')
var playlistTemplate  = require ('./JSONtemps')
var model             = require ('../../database/models')
var querystring       = require('querystring')

//TODO: add comments
function createPlaylist (req, res, db){
  hostAcountTools.validateHost (req.body.hostID)
  .then (function (hostInfo){
    return validatePlaylistInput(hostInfo, req.body.playName)
  })
  .then (function (validatedInput){
    return (requestSpotifyPlaylistCreation(validatedInput))
  })     
  .then (function(createdPlaylist){
    console.log (createdPlaylist)
    return setNewHomePage (createdPlaylist.hostID, createdPlaylist.playlistData.body['id'], createdPlaylist.playlistData.body['name'])
  })
  .then (function (update){
    console.log (update)
    return model.Host.findOneAndUpdate({ 'hostID' : update.hostID }, { $set: {'playlistID' : update.playlistID, 'playlistName' : update.playlistName, 'homepage' : update.homepage}}).exec()
    res.redirect (update.homepage)
    res.alert ('playlist created successfully with name: ' +update.playlistName)
  })
  .catch (function(err) {
    res.status(400).json ('error creating playlist: '+ err)
  })
}

//TODO: add comments
 function setLatestPlaylist (res, host){
  hostAcountTools.validateHost (host)
  .then (function (hostInfo){
    return hostAcountTools.spotifyApi.getUserPlaylists(hostInfo.hostID)
  })
  .then (function(data){
    return playlistTemplate.userPlaylists (host, data.body.items, data.body.total)
  })
  .then (function (playlistInfo){
    return model.Host.findOneAndUpdate({ 'hostID' : playlistInfo.playlists[0].owner }, { $set: {'playlistID' : playlistInfo.playlists[0].id, 'playlistName' : playlistInfo.playlists[0].name}}).exec()
  })
  .then (function (update){
    res.status(200).json ('playlist successfully set to latest playlist')
  })
  .catch (function (err){
    console.log (err.stack)
    res.status(400).json('error setting latest playlist: '+ err)
  })
}

// //TODO: add comments
function findAllPlaylists (req, res, db){
  hostAcountTools.validateHost (req.body.hostID)
  .then (function (hostInfo){
    return hostAcountTools.spotifyApi.getUserPlaylists(hostInfo.hostID)
  })
  .then (function(data){
    return playlistTemplate.userPlaylists (req.body.hostID, data.body.items, data.body.total)
  })
  .then (function (playlistInfo){
    return res.status(200).json (playlistInfo)
  })
  .catch (function (err){
    res.status(400).json ('error retriving user\'s playlists: '+err)
  })
}


function setSpecificPlaylist (req, res, db){
  hostAcountTools.validateHost (req.body.hostID)
  .then (function (hostInfo){
    return validatePlaylistInput(hostInfo, req.body.playlistID)
  })
  .then (function (validatedInput){
    return validatePlaylistOwnership (validatedInput)
  })
  .then (function (validRequest){
    return (model.Host.findOneAndUpdate({ 'hostID' : validRequest.hostID }, { $set: {'playlistID' : validRequest.playName}}).exec())
  })
  .then (function (updated){
    res.status(200).json ('playlist has been set successfully')
  })
  .catch (function(err) {
    res.status(400).json ('error setting playlist: '+ err)
  })
}

//This is the request threshold that will get a song added to the playlist, set by the host.
 function setRequestThreshold (req, res){
  model.Host.findOneAndUpdate({ 'hostID' : req.body.hostID }, { $set: {'reqThreshold' : req.body.requests }}).exec()
  .then (function (update){
    res.status(200).json ('number of requests to add a song to a playlist has been set to ' +req.body.requests+ '!')
  })
  .catch (function (err){
    console.log (err.stack)
    res.status(400).json('error setting the request threshold: '+ err)
  })
}

function validatePlaylistOwnership (data){
  return new Promise (function (fulfill, reject){
    hostAcountTools.spotifyApi.getPlaylist(data.hostID, data.playName)
    .then (function(playlist){
      fulfill (data)
    })
    .catch (function (err){
      reject ('spotify error: you either do not own that playlist or it does not exist, '+ err)
    })
  })
}

function validatePlaylistInput (hostInfo, playName) {
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

function setNewHomePage (hostID, playlistID, playlistName){
  return new Promise (function (fulfill, reject){
    var homePage = '/loggedIn.html#' +querystring.stringify({'hostID':hostID, 'playlistID': playlistID})
    fulfill ({
      'hostID'        : hostID,
      "playlistID"    : playlistID,
      "playlistName"  : playlistName,
      "homepage"      : homePage
    })
  })
}

function addTracksToPlaylist (guestObject){
  return new Promise (function (fulfill, reject){
    hostAcountTools.spotifyApi.setAccessToken(guestObject.host.access_token)
    hostAcountTools.spotifyApi.addTracksToPlaylist (guestObject.host.hostID, guestObject.host.playlistID, 'spotify:track:'+guestObject.track.trackID)
    .then (function (track){
      fulfill (guestObject)
    })
    .catch (function (err){
      reject (err)
    })
  })
}

module.exports = {
  createPlaylist      : createPlaylist,
  setLatestPlaylist   : setLatestPlaylist,
  findAllPlaylists    : findAllPlaylists,
  setSpecificPlaylist : setSpecificPlaylist,
  setRequestThreshold : setRequestThreshold,
  addTracksToPlaylist : addTracksToPlaylist
}