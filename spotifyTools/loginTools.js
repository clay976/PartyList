var tools = require ('../generalTools/tools');
var querystring = require('querystring');
var request = require('request'); // "Request" library
var insert = require ('../databasetools/insert');
var query = require ('../databasetools/querydb');
var update = require ('../databasetools/update');

var stateKey = 'spotify_auth_state'
var client_id = 'a000adffbd26453fbef24e8c1ff69c3b';
var client_secret = '899b3ec7d52b4baabba05d6031663ba2'; // Your client secret
var redirect_uri = 'http://104.131.215.55:80/callback';

// this is what the user will see when the click login for the first
// time, it tells them what our app will be allowed to access
// and provides the location of where the app will go after login
// with the redirect URI.
// the state is what will be checked by the app when
// we are trying to make calls afterward
function login (req, res) {
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
// this will prepare the JSON object with our applications
// authorization tokens for the spotify API.
// requests refresh and access tokens for the user
// after checking the state parameter
function getToHomePage (req, res, db) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/' +querystring.stringify({error: 'state_mismatch'}));
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
    // this request will use the object we just created to obtain the access
    // and refresh tokens for the specific user.
    request.post(authOptions, prepareTokenAccess)
  }
}

function prepareTokenAccess (error, response, body) {
  if (!error && response.statusCode === 200) {
    var access_token = body.access_token;
    var refresh_token = body.refresh_token;
    //databasecalls to save access and refresh tokens in the partyList collection
    //under the tokens document
    var options = {
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };
    // use the access token to access the Spotify Web API
    request.get(options, getHostInfo);
    // we can also pass the token to the browser to make requests from there
    res.redirect('/#');
  }else{
    res.redirect('/' +querystring.stringify({error: 'invalid_token'}));
  }
}

function getHostInfo (error, response, body) {
  host = (body.id).toString();
  docuSearch = query.findHost (host);
  var docuInsert = insert.apiInfo (host,access_token, refresh_token);
  //database call to save the tokens and user id as a host collection document
  query.search (host, docuSearch, db, updateOrInsert);
}

function updateOrInsert (found){
  //error handling within the found funtion itself 
  if (found != null){
    console.log ('user has been found');
    // found host so we will update their tokens to access api
    var updateInfo = update.bothTokens (access_token, refresh_token);
    update.updater (host, found, updateInfo,db, updateResponseHandler);
  }else{
    console.log ('creating new user');
    var docuInsert = insert.apiInfo (host,access_token, refresh_token);
    insert.insert (host, docuInsert, db, insertResponseHandler);
  };
}

module.exports = {
  login: login,
  getToHomePage: getToHomePage,
  prepareTokenAccess: prepareTokenAccess,
  getHostInfo: getHostInfo,
  updateOrInsert: updateOrInsert
}