//node modules
var querystring = require('querystring')
var request = require('request') // "Request" library
var SpotifyWebApi = require('spotify-web-api-node');

//my modules
var searchTemplate = require ('../../database/query/JSONtemps')
var updateTemplate = require ('../../database/update/JSONtemps')
var upsertTemplate = require ('../../database/upsert/JSONtemps')
var update = require (('../../database/update/responseHandler'))
var search = require ('../../database/query/search')
var dbHostTools = require ('../../database/hostTools')
var spotifyAccountTemplate = require ('./JSONtemps')

var model = require ('../../database/models')

var credentials = {
  clientId : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://104.131.215.55:80/callback'
};

var spotifyApi = new SpotifyWebApi(credentials);

// makes a request to the spotify API to retrieve
// the access and refresh tokens for the user
// preps them in to an "options" object to
// make another call for host info
function homepage (req, res, db) {
  var data = spotifyApi.authorizationCodeGrant(req.query.code).then (function(data) {
    spotifyApi.setAccessToken(data.body['access_token'])
    spotifyApi.setRefreshToken(data.body['refresh_token'])
    var homePage = '/#' +querystring.stringify({access_token: data.body['access_token'],refresh_token: data.body['refresh_token']})
    res.redirect (homePage)
    var access_token = data.body['access_token']
    var refresh_token = data.body['refresh_token']
    var hostInfo = (spotifyApi.getMe()).then (function (hostInfo){
      var query = {hostID: hostInfo.body.id}
      model.Host.findOneAndUpdate(query, upsertTemplate.Host (hostInfo.body.id, access_token, refresh_token, homePage), {upsert:true}).exec()
    })
  }).catch (function(err) {
    res.redirect ('/')
    console.log('Something went wrong', err.message);
  })
}

function refreshToken () {
  search (host,doc, db, function (docFound){
    request.post(spotifyAccountTemplate.accessFromRefresh(docFound.refresh_token), function (error, response, body) {
      if (!error && response.statusCode === 200) {
        db.collection(host).updateOne(searchTemplate.findHost (host), update.accessToken (body.access_token))
      }
    })
  })
}

function loginRedirect (res, code, message){
  res.redirect ('/?'+message+':'+code)
}

function validateHost (host){
  var hostInfo = (model.Host.findOne({ 'hostID' : host }).exec()).then (function (hostInfo){
    if (hostInfo){
      spotifyApi.setAccessToken(hostInfo.access_token)
      return hostInfo 
    }
  })
}


//exports for external modules to use.
module.exports = {
  loginRedirect: loginRedirect,
  homepage: homepage,
  validateHost: validateHost
}