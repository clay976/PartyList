var validateToken = require ('../databasetools/checkToken');
var request = require('request'); // "Request" library
var querystring = require('querystring');

function createPlaylist (req, res, db){
  if (req.body.playName) {
    var playlistName = req.body.playName;
    var host = req.body.host
    //database call to obtain access token, if access token is expired then
    //obtain new access token by using refresh token
    preparePlaylistRequest (res, db, playlistName, host)
  }else{
    console.log ('a user tried to create a blank nemed playlist')
    res.redirect('/#');
  }
}

function preparePlaylistRequest (res, db, playlistName, host){
  console.log (host)
  validateToken.checkToken (host, db, function (tokenValid, docFound){
    if (tokenValid){   
      var options = {
        url: 'https://api.spotify.com/v1/users/' +host+ '/playlists',
        body: JSON.stringify({
          'name': playlistName,
          'public': false
        }),
        dataType:'json',
        headers: {
          'Authorization': 'Bearer ' + docFound.access_token,
          'Content-Type': 'application/json',
        }
      }
      request.post(options, postPLaylistResponseHandler);
    }else{
      res.redirect('/' +querystring.stringify({error: 'token_has_expired_or_is_invalid'}));
    }
  })
}

function postPLaylistResponseHandler (error, res, body) {
  if (error){
    console.log ('there was an error creating a playlist, ' + error);
    res.redirect('/#' +querystring.stringify({error: 'there_was_an_error_creating_this_playlist'}));
  }else{
    console.log ('a playlist was created succsefully,' + body);
    res.redirect('/#' +querystring.stringify({reponse: 'Success!'}));
  }
}

module.exports = {
  createPlaylist: createPlaylist,
  preparePlaylistRequest: preparePlaylistRequest,
  postPLaylistResponseHandler: postPLaylistResponseHandler,
}