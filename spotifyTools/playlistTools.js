var validateToken = require ('../databasetools/checkToken');
var request = require('request'); // "Request" library

function createPlaylist (req, res, host, db){
  if (req.body.playName) {
    var playlistName = req.body.playName;
    //database call to obtain access token, if access token is expired then
    //obtain new access token by using refresh token
    validateToken.checkToken (host, db, preparePlaylistRequest);
  }else{
    console.log ('a user tried to create a black nemed playlist')
    res.redirect('/#' +querystring.stringify({error: 'please enter a playlist name'}));
  };
};

function preparePlaylistRequest (req, res, tokenValid, docFound, playlistName, res){
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
    };
    request.post(options, postPLaylistResponseHandler);
  }else{
    res.redirect('/login' +querystring.stringify({error: 'token has expired or is invalid'}));
  };
}

function postPLaylistResponseHandler (error, response, body) {
  if (error){
    console.log ('there was an error creating a playlist, ' + error);
    res.redirect('/#' +querystring.stringify({error: 'there was an error creating this playlist'}));
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