//node modules
var querystring = require('querystring')
var request = require('request') // "Request" library
var SpotifyWebApi = require('spotify-web-api-node');

//my modules
var searchTemplate = require ('../../database/query/JSONtemps')
var search = require ('../../database/query/search')
var dbHostTools = require ('../../database/hostTools')
var spotifyAccountTemplate = require ('./JSONtemps')

//other variables

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.

// Create the authorization URL

var credentials = {
  clientId : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://104.131.215.55:80/callback'
};

var spotifyApi = new SpotifyWebApi(credentials);

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
  spotifyApi.authorizationCodeGrant(req.query.code)
  .then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      var hostInfo = spotifyApi.getMe()
      .then(function(hostInfo) {
      console.log('Retrieved data for ' + hostInfo.body['display_name']);
      // "Email is farukemresahin@gmail.com"
      console.log('Email is ' + hostInfo.body.email);
      // "This user has a premium account"
      console.log('This user has a ' + hostInfo.body.product + ' account');
      search.search (hostInfo.body['display_name'], searchTemplate.findHost (hostInfo.body['display_name']), db, function (found){
        if (found != null){
          console.log ('user has been found')
          db.collection(hostInfo.body['display_name']).updateOne(found, updateTemplate.bothTokens (data.body['access_token'], data.body['refresh_token']), updateResponseHandler)
        }else{
          console.log ('creating new user')
          db.collection(hostInfo.body['display_name']).insertOne(insertTemplate.apiInfo (hostInfo.body['display_name'], data.body['access_token'], data.body['refresh_token']), insertResponseHandler)
        }
      })
      res.redirect ('/#' +querystring.stringify({access_token: data.body['access_token'],refresh_token: data.body['refresh_token']}))
    })
    .catch(function(err) {
      console.log('Something went wrong', err.message);
    })
  })
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
  homepage: homepage,
  getHostInfo: getHostInfo,
  loginRedirect: loginRedirect,
  homePageRedirect: homePageRedirect,
  checkToken: checkToken
}