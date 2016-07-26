//node modules
var request = require('request') // "Request" library
var querystring = require('querystring')

//my modules
var loginTool = require ('../account/tools')
var hostTools = require ('../../database/hostTools')
var updateTemplate = require ('../../database/update/JSONtemps')
var search = require ('../../database/query/search')
var playlistTemplate = require ('./JSONtemps')
var accountTemplate = require ('../account/JSONtemps')
var model = require ('../../database/models')

//TODO: add comments
function createPlaylist (req, res, db){
  var playlistName = req.body.playName
  var hostID = req.body.host
  var hostInfo = model.Host.findOne({ 'hostID': hostID })
  hostInfo.then (function (hostInfo, hostID, playlistName){
    if (hostInfo){
      if (playlistName){
        postPlaylist (res, db, hostID, playlistTemplate.createPlaylist (host, playlistName, hostInfo.access_token), hostInfo, updatePlaylist)
      }else{
        loginTool.homePageRedirect (res, 400, 'a user tried to create a playlist with an invalid name')
      }
    }else{
      loginTool.loginRedirect (res, 401, 'a user with invalid tokens tried to create a playlist')
    }
  })
}
//TODO: add comments
function findPlaylist (res, db, host){
  hostTools.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){
      requestLatestPlaylist (res, db, host, accountTemplate.authForAccount (host, docFound.access_token), docFound, updatePlaylist)
    }else{
      loginTool.loginRedirect (res, 401, ' a user with invalid tokens tried to find a playlist')
    }  
  })
}

//TODO: add comments
function requestLatestPlaylist (res, db, host, options, docFound, callback){
  request.get(options, function (error, response, body) {
    var playlistItems = JSON.parse (body)
    if (error) {
      loginTool.homePageRedirect (res, 500, 'there was an error finding the playlist on spotify\'s end, ')
    }else{
      loginTool.homePageRedirect (res, 200, 'playlist was found and updated succsefully')
      callback (db, host, docFound, playlistItems.items[0].id)
    }
  })
}


//TODO: add comments
function postPlaylist (res, db, host, options, docFound, callback){
  request.post(options, function (error, response, body){
    if (error){
      console.log (error, "error")
      loginTool.homePageRedirect (res, 500, 'there was an error creating a playlist on spotify\'s end, ')
    }else{
      var playlist = JSON.parse (body)
      callback (db, host, docFound, playlist.id)
      loginTool.homePageRedirect (res, 200, 'playlist was created succsefully '+ playlist.id)
    }
  })
}

function updatePlaylist (db, host, docFound, playlistID){
  updateTemplate.playlistID (playlistID)
}

module.exports = {
  findPlaylist: findPlaylist,
  createPlaylist: createPlaylist,
  postPlaylist: postPlaylist,
  updatePlaylist: updatePlaylist
}