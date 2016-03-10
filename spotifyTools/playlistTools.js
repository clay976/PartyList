var loginTool = require ('./loginTools');
var validateToken = require ('../databasetools/checkToken');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var update = require ('../databasetools/update');

function findPlaylist (res, db, host){
  validateToken.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){
      var options = {
        url: 'https://api.spotify.com/v1/users/' + host + '/playlists',
        headers: {'Authorization': 'Bearer ' +docFound.access_token}
      };
      requestLatestPlaylist (res, db, host, options, docFound)
    }else{
      loginTool.loginRedirect (res, 401, ' a user with invalid tokens tried to find a playlist')
    }  
  })
}

function requestLatestPlaylist (res, db, host, options, docFound){
  request.get(options, function (error, response, body) {
    if (error) {
      loginTool.homePageRedirect (res, 500, ' there was an error finding the playlist on spotify\'s end, ');
    }else{
      playlistItems= JSON.parse (body);
      var playlistID = playlistItems.items[0].id;
      updatePlaylist (db, host, docFound, playlistID)
      loginTool.homePageRedirect (res, 400, ' playlist was found and updated succsefully')
    };
  })
}

//TODO: add comments
function createPlaylist (res, db, playlistName, host){
  validateToken.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){
      var access_token = docFound.access_token
      if (playlistName) {
        preparePlaylistRequest (res, db, playlistName, host, docFound, access_token)
      }else{
        loginTool.homePageRedirect (res, 400, ' a user tried to create a blank named playlist')
      }
    }else{
      loginTool.loginRedirect (res, 401, ' a user with invalid tokens tried to create a playlist')
    }
  })
}

//TODO: add comments
function preparePlaylistRequest (res, db, playlistName, host, docFound, access_token){
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
  postPlaylist (res, options, docFound)
}

function postPlaylist (res, options, docFound){
  request.post(options, function (error, response, body){
    if (error){
      console.log (error)
      loginTool.homePageRedirect (res, 500, ' there was an error creating a playlist on spotify\'s end, ');
    }else{
      var playlist = JSON.parse (body);
      var playlistID = playlist.id
      updatePLaylist (db, host, docFound, playlistID)
      loginTool.homePageRedirect (res, 200, ' playlsit was created succsefully')
      console.log ('a playlist was created succsefully,' + body);
    }
  })
}

function updatePlaylist (db, host, docFound, playlistID){
  var updateInfo = update.playlistID (playlistID)
  update.updater (host, docFound, updateInfo, db, function (err){
    if (err){
      console.log (err);
    }else{
      console.log ("playlist updated");
    };
  });
}

module.exports = {
  findPlaylist: findPlaylist,
  createPlaylist: createPlaylist,
  preparePlaylistRequest: preparePlaylistRequest,
  postPlaylist: postPlaylist,
  updatePlaylist: updatePlaylist
}