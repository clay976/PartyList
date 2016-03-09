var tools = require ('../generalTools/tools');
var querystring = require('querystring');
var request = require('request'); // "Request" library
var removeSonglist = require ('../databasetools/removeSonglist');
var insert = require ('../databasetools/insert');
var query = require ('../databasetools/querydb');
var update = require ('../databasetools/update');
var validateToken = require ('../databasetools/checkToken');

var stateKey = 'spotify_auth_state'
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

module.exports.handleHomePage = function (req, res) {
  //requests refresh and access tokens
  //after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +querystring.stringify({error: 'state_mismatch'}));
  }else{
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    //this is the actual post to retreive the access and refresh tokens that wqill be used later.
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        var refresh_token = body.refresh_token;
        //databasecalls to save access and refresh tokens in the partyList collection
        //unser the tokens document
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          var found;
          host = (body.id).toString();
          console.log ('searching for ' + host);
          docuSearch = query.findHost (host);
          var docuInsert = insert.apiInfo (host,access_token, refresh_token);
          //database call to save the tokens and user id as a host collection document
          query.search (host, docuSearch, db, function (found){
            //error handling within the found funtion itself 
            if (found != null){
              // found host so we will update their tokens to access api
              var updateInfo = update.bothTokens (access_token, refresh_token);
              update.updater (host, found, updateInfo,db, function (error){
                console.log ('updated the tokens');
                console.log (found);
              });
            }else{
              console.log ('creating new user');
              insert.insert (host, docuInsert, db, function (result){
                //error handling withjin the insert funtion itself
                console.log("Inserted a document into the " +host+ " collection.");
                console.log (result);
              });
            };
          });
        });
        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +querystring.stringify({access_token: access_token,refresh_token: refresh_token}));
      }else{
        res.redirect('/#' +querystring.stringify({error: 'invalid_token'}));
      }
    })
  }
}