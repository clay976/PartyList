//node modules
var querystring = require('querystring')
var SpotifyWebApi = require('spotify-web-api-node');

//my modules
var upsertTemplate = require ('../../database/upsert/JSONtemps')
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
  spotifyApi.authorizationCodeGrant(req.query.code)
  .then (function(data) { //change to: .then (setUpHostInfo(data))
    spotifyApi.setAccessToken(data.body['access_token'])
    spotifyApi.setRefreshToken(data.body['refresh_token'])
    var homePage = '/#' +querystring.stringify({access_token: data.body['access_token'],refresh_token: data.body['refresh_token']})
    res.redirect (homePage)
    var access_token = data.body['access_token']
    var refresh_token = data.body['refresh_token']
    spotifyApi.getMe()
    .then (function (hostInfo){ //change to: .then (updateOrInsertOnLogin (hostInfo))
      model.Host.findOneAndUpdate({hostID: hostInfo.body.id}, upsertTemplate.Host (hostInfo.body.id, access_token, refresh_token, homePage), {upsert:true}).exec()
    })
  }).catch (function(err) {
    console.log('Something went wrong: ');
    res.status(400).redirect ('/?'+err.message)
  })
}

function validateHost (host){
  return new Promise (function (fulfill, reject){
    model.Host.findOne({ 'hostID' : host }).exec()
    .then (function (hostInfo){
      if (hostInfo){
        console.log (hostInfo)
        fulfill (hostInfo) 
      }else{
        console.log ('could not find this document in our database, this may be a problem on our end, sorry!')
        reject ('could not find this document in our database, this may be a problem on our end, sorry!')
      }
    })
    .catch (function (err){
      console.log ('validating host failed')
    })
  })
}


//exports for external modules to use.
module.exports = {
  homepage: homepage,
  validateHost: validateHost
}