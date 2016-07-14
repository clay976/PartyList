//node modules
var request = require('request') // "Request" library
var querystring = require('querystring')

//my modules
var loginTool = require ('../account/tools')
var hostTools = require ('../../database/hostTools')
var updateTemps = require ('../../database/update/JSONtemps')

//TODO: add comments
function findPlaylist (res, db, host){
  hostTools.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){
      requestLatestPlaylist (res, db, host, makeJSON.auth (host, access_token), docFound, updatePlaylist)
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
      var playlistID = playlistItems.items[0].id
      loginTool.homePageRedirect (res, 200, 'playlist was found and updated succsefully')
      callback (db, host, docFound, playlistID)
    }
  })
}

//TODO: add comments
function createPlaylist (res, db, playlistName, host, callback){
  hostTools.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){
      var access_token = docFound.access_token
      if (playlistName) {
        var playlistReqObject = preparePlaylistRequest (playlistName, access_token)
        postPlaylist (res, db, host, playlistReqObject, docFound, updatePlaylist)
      }else{
        loginTool.homePageRedirect (res, 400, 'a user tried to create a playlist with an invalid name')
      }
    }else{
      loginTool.loginRedirect (res, 401, 'a user with invalid tokens tried to create a playlist')
    }
  })
}

//TODO: add comments
function preparePlaylistRequest (playlistName, access_token){
  var options = {
    url: 'https://api.spotify.com/v1/users/' +host+ '/playlists',
    body: JSON.stringify({
      'name': playlistName,
      'public': false
    }),
    dataType:'json',
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json',
    }
  }
  return (options)
}

//TODO: add comments
function postPlaylist (res, db, host, options, docFound, callback){
  request.post(options, function (error, response, body){
    if (error){
      console.log (error, "error")
      loginTool.homePageRedirect (res, 500, 'there was an error creating a playlist on spotify\'s end, ')
    }else{
      var playlist = JSON.parse (body)
      var playlistID = playlist.id
      callback (db, host, docFound, playlistID)
      loginTool.homePageRedirect (res, 200, 'playlist was created succsefully '+ playlistID)
    }
  })
}

function updatePlaylist (db, host, docFound, playlistID){
  updateTemps.playlistID (playlistID)
}

module.exports = {
  findPlaylist: findPlaylist,
  createPlaylist: createPlaylist,
  preparePlaylistRequest: preparePlaylistRequest,
  postPlaylist: postPlaylist,
  updatePlaylist: updatePlaylist
}