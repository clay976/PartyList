var loginTool = require ('./loginTools')
var validateToken = require ('../databasetools/checkToken')
var request = require('request') // "Request" library
var querystring = require('querystring')
var update = require ('../databasetools/update')

function findPlaylist (res, db, host){
  validateToken.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){
      var options = {
        url: 'https://api.spotify.com/v1/users/' + host + '/playlists',
        headers: {'Authorization': 'Bearer ' +docFound.access_token}
      }
      requestLatestPlaylist (res, db, host, options, docFound)
    }else{
      loginTool.loginRedirect (res, 401, ' a user with invalid tokens tried to find a playlist')
    }  
  })
}

function requestLatestPlaylist (res, db, host, options, docFound){
  request.get(options, function (error, response, body) {
    var playlistItems= JSON.parse (body)
    if (error) {
      loginTool.homePageRedirect (res, 500, ' there was an error finding the playlist on spotify\'s end, ')
    }else{
      var playlistID = playlistItems.items[0].id
      updatePlaylist (db, host, docFound, playlistID)
      loginTool.homePageRedirect (res, 400, ' playlist was found and updated succsefully')
    }
  })
}

//TODO: add comments
function createPlaylist (res, db, playlistName, host, callback){
  validateToken.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){
      var access_token = docFound.access_token
      if (playlistName) {
        callback (res, db, playlistName, host, docFound, access_token, postPlaylist)
      }else{
        loginTool.homePageRedirect (res, 400, ' a user tried to create a blank named playlist')
      }
    }else{
      loginTool.loginRedirect (res, 401, ' a user with invalid tokens tried to create a playlist')
    }
  })
}

//TODO: add comments
function preparePlaylistRequest (res, db, playlistName, host, docFound, access_token, callback){
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
  callback (res, db, host, options, docFound, updatePlaylist)
}

function postPlaylist (res, db, host, options, docFound, callback){
  request.post(options, function (error, response, body){
    if (error){
      console.log (error, "error")
      loginTool.homePageRedirect (res, 500, ' there was an error creating a playlist on spotify\'s end, ')
    }else{
      var playlist = JSON.parse (body)
      var playlistID = playlist.id
      callback (db, host, docFound, playlistID)
      loginTool.homePageRedirect (res, 200, ' playlist was created succsefully')
      console.log ('a playlist was created succsefully,')
    }
  })
}

function updatePlaylist (db, host, docFound, playlistID){
  var updateInfo = update.playlistID (playlistID)
  update.updater (host, docFound, updateInfo, db, function (err){
    if (err){
      console.log (err, "error")
    }else{
      console.log ("playlist updated")
    }
  })
}

module.exports = {
  findPlaylist: findPlaylist,
  createPlaylist: createPlaylist,
  preparePlaylistRequest: preparePlaylistRequest,
  postPlaylist: postPlaylist,
  updatePlaylist: updatePlaylist
}