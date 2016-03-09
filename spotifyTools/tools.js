var tools = require ('../generalTools/tools');
var stateKey = 'spotify_auth_state'
var querystring = require('querystring');
var client_id = 'a000adffbd26453fbef24e8c1ff69c3b';
var redirect_uri = 'http://104.131.215.55:80/callback';

module.exports.login = function (req, res) {
  var state = tools.generateRandomString(16);
  res.cookie(stateKey, state);
  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-birthdate streaming playlist-modify-private playlist-modify-public playlist-read-private';
  res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  }));
}