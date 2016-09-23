
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
  .then (function(data) {
    var access_token = data.body['access_token']
    var refresh_token = data.body['refresh_token']
    var homePage = '/#' +querystring.stringify({'access_token': access_token,'refresh_token':refresh_token})
    spotifyApi.getMe()
    .then (function (hostInfo){
      model.Host.findOneAndUpdate({'hostID': hostInfo.body.id}, upsertTemplate.Host (hostInfo.body.id, access_token, refresh_token, homePage), {upsert:true}).exec()
      .then (function (host){
        console.log (host)
        res.redirect (host.homePage)
      })
    })
  })
  .catch (function(err) {
    console.log('Something went wrong: '+ err);
    res.status(400).redirect ('/?'+err)
  })
}

function explicitFilter (req, res, db){
  validateHost (req.body.host)
  .then (function (hostInfo){
    console.log ('setting explicit filter to ' + req.body.explicit+ ' for ' +hostInfo.hostID) 
    model.Host.findOneAndUpdate({ 'hostID' : hostInfo.host }, { $set: {'playlistID' : req.body.explicit}}).exec()
    .then (res.status(200).redirect (hostInfo.homePage))  
  })
  .catch (function (err){
    console.log ('validating host failed' +err.stack)
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
        console.log ('could not find this host in our database, this may be a problem on our end, sorry!')
        reject ('could not find this host in our database, this may be a problem on our end, sorry!')
      }
    })
    .catch (function (err){
      console.log ('validating host failed' +err.stack)
    })
  })
}

//exports for external modules to use.
module.exports = {
  homepage: homepage,
  validateHost: validateHost,
  explicitFilter: explicitFilter
}