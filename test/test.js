//node modules 
var should = require('should')
var assert = require('assert')
var request = require('supertest')
var querystring = require('querystring')
var SpotifyWebApi = require('spotify-web-api-node');
var credentials = {
  clientId : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri : 'http://104.131.215.55:80/callback'
};
var spotifyApi = new SpotifyWebApi(credentials);

//my modules
var model = require ('../database/models')
var guestTools = require ('../database/guestTools')
var upsertTemplate = require ('../database/upsert/JSONtemps')
var spotifyAccountTool = require ('../spotify/account/tools')

//variables
var url = 'localhost'

/*BEFORE EACH RUN OF TESTS!!
use this url to retrieve a code so we can obtain access tokens
for the tests. 

https://accounts.spotify.com/authorize?response_type=code&client_id=a000adffbd26453fbef24e8c1ff69c3b&scope=user-read-private%20user-read-email%20user-read-birthdate%20streaming%20playlist-modify-private%20playlist-modify-public%20playlist-read-private&redirect_uri=http%3A%2F%2F104.131.215.55%3A80%2Fcallback

place the code in this next variable
*/
var code = 'AQBd3bafVTns4v2F5bTiPeBkQJTCRYA3tbb2H0zJwqC2oxsbOjyFDTRGcaLBDpkcQR8XGz7bQh3ONZQYi9sfaOYey2k98SMEEvvIT-TmecZVYwm3OmAifkle8YK_7Wz870TO06giYYjTyey198oen88VbdmkVhPtOih3I0Yv_0-AoTkhlVMsNagAdTaE-L4QlEmHUq9dymgERcsda16xcQfgvp11WcjH75dX1FHGGzg4hixL3ook6z4fwov0iPQKtq1oJeZs4JKm9Zrx9YsZbRV9HoCPFtMvU6lIHmyqvQTdSE2tTS6OMEKAXf2GfQEN2rpFsVHCBqdL-xTcVt6-yMXeAgflp7ltYpLhJfixtuQK_VO-pA0ovE0CX4L1otufG3JZ'
var access_token, refresh_token

//start tests
describe('GET /login', function(){
  it('hit the login endpoint to make sure it redirects to spotify\'s login page', function(done){
    request(url)
    .get('/login')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.redirect.should.equal (true)
      res.status.should.equal(302);
      done();
    });
  });
})

describe('GET /callback', function(){
  it('hit the callback enpoint with a valid authorization code. should obtain access tokens and redirect.', function(done){
    request(url)
    .get('/callback?code='+code)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log ('res: ' +JSON.stringify(res.body))
      res.status.should.equal(302);
      done();
    });
  });
})

/*
describe('test accesing the spotify api with an authorization code that is generated before the tests', function(){
  it ('get Oauth tokens with authorization code', function(){
  })
  it ('fail to get Oauth tokens because of an invalid authorization code', function(){
    return spotifyApi.authorizationCodeGrant('badCode')
    .catch (function (err){
      err.message.should.equal('invalid_grant: Invalid authorization code');
    })
  })
})

describe('Spotify Account Tools', function(){
  it('validate a host', function(){
    var promise = spotifyAccountTool.validateHost ('clay976')
    return promise.then (function (host){
      console.log (host)
      host.hostID.should.equal ('clay976')
    })
  });
  it('fail to validate a host', function(){
    var promise = spotifyAccountTool.validateHost ('badHost') 
    return promise.catch (function (err){
      console.log (err)
    })
  });
})

describe('POST /playlist/spotify/create', function(){
  it('try to post a playlist', function(done){
    postData = {
      "playName"  : "testing",
      "host"      : "clay976"
    }
    request(url)
    .post ('/playlist/spotify/create')
    .send (postData)
    .end (function(err, res) {
      if (err) {
        throw err;
      }
      console.log ('res: '+res.body)
      res.status.should.equal(200);
      done();
    });
  });
})

describe('POST /guests/add', function(){
  it('add a guest to the database succsefully', function(done){
    postData = {
      "guestNum"  : "1234567890",
      "host"      : "clay976" 
    }
    request(url)
    .post('/guests/add?')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.body.should.equal ('guest added succsefully')
      res.status.should.equal(200);
      done();
    });
  });
  it('fail to addd aguest to the database because of malformed syntax', function(done){
    postData = {"guestNum" : "1000"}
    request(url)
    .post('/guests/add?')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.body.should.equal ('number recieved not in the right format, please retry with the format "1234567890" (no speacial characters)')
      res.status.should.equal(400);
      done();
    });
  });
})

describe('unit testing for guest functions', function(){
  it('successfully validate a guest that is already in our database', function(){
    data = {'body':{"guestNum"  : "1234567890"}}
    return guestTools.validateGuest (data).then (function (guest){
      console.log (guest)
      guest.hostID.should.equal ('clay976')
      guest.phoneNum.should.equal ('1234567890')
    })
  });
})*/