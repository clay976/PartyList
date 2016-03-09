var validateToken = require ('../databasetools/checkToken');
var request = require('request'); // "Request" library

module.exports.createPlaylist = function (host, req, res){
  if (host){
    if (req.body.playName) {
      var playlistname = req.body.playName;
      //database call to obtain access token, if access token is expired then
      //obtain new access token by using refresh token
      validateToken.checkToken (host, db, function (tokenValid, docFound){
        if (tokenValid){   
          var options = {
            url: 'https://api.spotify.com/v1/users/' +host+ '/playlists',
            body: JSON.stringify({
              'name': playlistname,
              'public': false
            }),
            dataType:'json',
            headers: {
              'Authorization': 'Bearer ' + docFound.access_token,
              'Content-Type': 'application/json',
            }
          };
          request.post(options, function (error, response, body) {
            if (error){
              console.log (error);
            }
          });
          res.redirect('/#' +querystring.stringify({access_token: docFound.access_token,refresh_token: docFound.refresh_token}));
        }else{
          res.redirect('/login');
        };
      });
    }else{
      res.send({error: 'please_enter_a_name'});
    };
  }else{
    res.redirect('/');
  };
};