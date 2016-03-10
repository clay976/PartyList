var loginTool = require ('./loginTools');
var validateToken = require ('../databasetools/checkToken');
var request = require('request'); // "Request" library
var querystring = require('querystring');

//TODO: add comments
function createPlaylist (res, db, playlistName, host){
  validateToken.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){
      if (playlistName) {
        var access_token = docFound.access_token
        var refresh_token = docFound.refresh_token  
        preparePlaylistRequest (res, db, playlistName, host, access_token, refresh_token)
      }else{
        loginTool.homePageRedirect (res, 400, 'a user tried to create a blank named playlist')
      }
    }else{
      loginTool.loginRedirect (res, 401, 'a user with invalid tokens tried to create a playlist with bad tokens')
    }
  })
}

//TODO: add comments
function preparePlaylistRequest (res, db, playlistName, host, access_token, refresh_token){
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
  postPlaylist (res, db)
  request.post(options, postPLaylistResponseHandler)
  loginTool.homePageRedirect (res, 200, 'playlsit was created succsefully', access_token, refresh_token)
}

//TODO: add comments
function postPLaylistResponseHandler (error, response, body) {
  if (error){
    console.log ('there was an error creating a playlist, ' + error);
  }else{
    console.log ('a playlist was created succsefully,' + body);
  }
}

module.exports = {
  createPlaylist: createPlaylist,
  preparePlaylistRequest: preparePlaylistRequest,
  postPLaylistResponseHandler: postPLaylistResponseHandler,
}