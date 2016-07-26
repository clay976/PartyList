//node modules
var querystring = require('querystring')
var request = require('request') // "Request" library
var SpotifyWebApi = require('spotify-web-api-node');

//my modules
var searchTemplate = require ('../../database/query/JSONtemps')
/*var search = require ('../../databasetools/query/search')
var update = require ('../../databasetools/update')*/
var dbHostTools = require ('../../database/hostTools')
var spotifyAccountTemplate = require ('./JSONtemps')

//other variables
var stateKey = 'spotify_auth_state'

var credentials = {
  clientId : '000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://localhost:80/callback'
};

var spotifyApi = new SpotifyWebApi(credentials)

// this is what the user will see when they click login for the first
// time, it tells them what our app will be allowed to access
// and provides the location of where the app will go after login
// with the redirect URI.
// the state is what will be checked by the app when
// we are trying to make calls afterward to make sure
// they are still logged in
function login (req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify(spotifyAccountTemplate.buildScope()))
}

// makes a request to the spotify API to retrieve
// the access and refresh tokens for the user
// preps them in to an "options" object to
// make another call for host info
function homepage (req, res, db) {

  spotifyApi.authorizationCodeGrant(code)
  .then(function(data) {
    console.log('The token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    console.log('The refresh token is ' + data.body['refresh_token']);
    getHostInfo (res, db, spotifyAccountTemplate.getHostInfo (data.body['access_token']), data.body['access_token'], data.body['refresh_token'], dbHostTools.UOIHost)
  }, function(err) {
    res.redirect (403, '/')
    console.log('Something went wrong!', err);
  });
}

// makes another request to the spotify API to
// obtain the rest of the host information and
// calls the insertOrUpdate function to find them
// and update them or straight insert them
function getHostInfo (res, db, options, access_token, refresh_token, callback) {
  request.get(options, function (error, response, body){
    if (error){
      loginRedirect (res, 500, error)
    }else{
      callback (res, db, (body.id).toString(), searchTemplate.findHost ((body.id).toString()), access_token, refresh_token)
    }
  })
}

function loginRedirect (res, code, message){
  res.redirect ('/'+code)
}

function homePageRedirect (res, statusCode, message){
  res.send (statusCode, message)
}

function refreshToken () {
  search (host,doc, db, function (docFound){
    request.post(spotifyAccountTemplate.accessFromRefresh(docFound.refresh_token), function (error, response, body) {
      if (!error && response.statusCode === 200) {
        db.collection(host).updateOne(searchTemplate.findHost (host), update.accessToken (body.access_token), updateResponseHandler)
      }
    })
  })
}

function checkToken (host, db, callback){
  search (host, {'host':host}, db, function(found){ 
    if (found != null){
      callback (true, found)
    }else{
      callback (false, null)
    }
  })
}

function generateRandomString (length) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

//exports for external modules to use.
module.exports = {
  login: login,
  retrieveAndPrepTokens: retrieveAndPrepTokens,
  getHostInfo: getHostInfo,
  loginRedirect: loginRedirect,
  homePageRedirect: homePageRedirect,
  checkToken: checkToken
}