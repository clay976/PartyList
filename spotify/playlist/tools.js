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
  var HostID = req.body.host
  var hostInfo = model.Host.findOne({ 'hostID' : HostID }).exec()
  .then (function (hostInfo){
    if (hostInfo){
      spotifyApi.setAccessToken(hostInfo.access_token)
      if (playlistName){
        spotifyApi.createPlaylist(HostID, playlistName, { public : true })
      }else{
        loginTool.homePageRedirect (res, 400, 'a user tried to create a playlist with an invalid name')
      }
    }else{
      loginTool.loginRedirect (res, 401, 'error:a user with invalid tokens tried to create a playlist')
    }
  })
  .catch (function (err){
    res.send (400, 'something went wrong'+err)
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

function updatePlaylist (db, host, docFound, playlistID){
  updateTemplate.playlistID (playlistID)
}

module.exports = {
  findPlaylist: findPlaylist,
  createPlaylist: createPlaylist,
  updatePlaylist: updatePlaylist
}