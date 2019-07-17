// module paths without the ../../.. shit.
require('app-module-path').addPath('/Users/claytonwarren/MyPorojects/PartyList');

//node modules 
var should            = require('should')
var assert            = require('assert')
var request           = require('supertest')
var querystring       = require('querystring')

//app modules
var refreshTokens     = require ('services/spotify/account/refreshTokens')
var hostTemplate      = require ('database/JSONtemps')
var updateHostinDB    = require ('database/host/update')

//variables
var url = 'localhost'
var validHostFail = 'validation error: could not find this host in our database, You must log in to continue'

/*BEFORE EACH RUN OF TESTS!!
1. open postman
2. 
*/

var refreshToken = process.env.CRIW_DUMMY_REFRESH
var hostID = process.env.CRIW_DUMMY_SPOTIFY_USER
var host = {}
var playlistID = ''

before(function(){
  console.log ('starting pre test functions')
  postData = {
    "playName"    : "Mocha Test " + new Date(),
    "hostID"      : hostID
  }
  host.databaseHost = hostTemplate.Host (hostID, '', refreshToken, '', '', '')
  return refreshTokens (host)
  .then (function (host){
    request(url)
    .post('/playlist/spotify/create')
    .send (postData)
    .end(function(err, res) {
      playlistID = res.headers.location.split ('=')[2]
      console.log (playlistID)
      console.log ('finished create playlist')
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.status.should.equal(302);
    });
  })
  .catch (function (err){
    console.log ('pre-test error: ' +err)
  })
})

//start tests
describe('GET /', function(){
  it('Ensure app is started test', function(done){
    request(url)
    .get ('')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.status.should.equal(200);
      done();
    })
  });
})

describe('POST /playlist/spotify/delete', function(){
  it('successfully delete a spotify playlist', function(done){
    postData = {
      "playlistID"  : playlistID,
      "hostID"      : hostID
    }
    request(url)
    .post('/playlist/spotify/delete')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.status.should.equal(200);
      done();
    });
  });
});

/*

  it('successfully create a spotify playlist', function(done){
    postData = {
      "playName"  : "",
      "host"      : hostID
    }
    request(url)
    .post('/playlist/spotify/create')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('playlist was created successfully')
      res.status.should.equal(200);
      done();
    });
  });
})

/*

describe('GET /callback', function(){
  it('hit the callback endpoint with a bad authorization code. should be a redirect back to login.', function(done){
    request(url)
    .get('/login/callback?code=badcode')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.body.should.equal('error: WebapiError: Bad Request');
      res.status.should.equal(400);
      done();
    });
  });
})

describe('POST /playlist/spotify/create', function(){
  it('successfully create a spotify playlist', function(done){
  });
})

/*

it('fail to create a playlist because name of playlist was missing', function(done){
    postData = {
      "host"      : "clay976"
    }
    request(url)
    .post('/playlist/spotify/create')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('error creating playlist: we did not recieve playlist information')
      res.status.should.equal(400);
      done();
    });
  });
  it('fail to create a spotify playlist because host validation failed', function(done){
    postData = {
      "host"      : "noHost",
      "playName"  : "mocha test"
    }
    request(url)
    .post('/playlist/spotify/create')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('error creating playlist: '+ validHostFail)
      res.status.should.equal(400);
      done();
    });
  });




describe('POST /playlist/spotify/set', function(){
  it('successfully set a playlist that the user owns', function(done){
    postData = {
      "playlistID"  : "0ktJLEaSUXtKIJPcRB2cK4",
      "host"        : "clay976"
    }
    request(url)
    .post('/playlist/spotify/set')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('playlist has been set successfully')
      res.status.should.equal(200);
      done();
    });
  })
  it('try to set a playlist ID that the user does not own', function(done){
    postData = {
      "playlistID"  : "4VJ8BH056GfU5IdxVnaBNP",
      "host"        : "clay976"
    }
    request(url)
    .post('/playlist/spotify/set')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('error setting playlist: spotify error: you either do not own that playlist or it does not exist, WebapiError: Not found.')
      res.status.should.equal(400);
      done();
    });
  });
  it('fail to set a playlist ID because input host information was missing', function(done){
    postData = {
      "playlistID"      : "0ktJLEaSUXtKIJPcRB2cK4"
    }
    request(url)
    .post('/playlist/spotify/set')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('error setting playlist: '+ validHostFail)
      res.status.should.equal(400);
      done();
    });
  });
  it('fail to set a playlist ID because input ID of playlist was missing', function(done){
    postData = {
      "host"      : "clay976"
    }
    request(url)
    .post('/playlist/spotify/set')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('error setting playlist: we did not recieve playlist information')
      res.status.should.equal(400);
      done();
    });
  });
  it('fail to set a playlist ID because host validation failed', function(done){
    postData = {
      "host"      : "noHost",
      "playName"  : "mocha test"
    }
    request(url)
    .post('/playlist/spotify/set')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('error setting playlist: '+ validHostFail)
      res.status.should.equal(400);
      done();
    });
  });
})

describe('POST /playlist/spotify/latest', function(){
  it('successfully ask for the latest playlist in spotify to be set.', function(done){
    postData = { "host" : "clay976" }
    request(url)
    .post('/playlist/spotify/latest')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal('playlist successfully set to latest playlist');
      res.status.should.equal(200);
      done();
    });
  });
  it('fail to validate the host when trying to set the latest playlist', function(done){
    postData = { "host" : "badHost" }
    request(url)
    .post('/playlist/spotify/latest')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('error setting latest playlist: '+validHostFail)
      res.status.should.equal(400);
      done();
    });
  });
})


describe('POST /playlist/spotify/getAll', function(){
  it('successfully ask for all the user\'s playlists', function(done){
    postData = { "host" : "clay976" }
    request(url)
    .post('/playlist/spotify/getAll')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.status.should.equal(200);
      done();
    });
  });
  it('fail to validate the host when trying to ask for all the user\'s playlists', function(done){
    postData = { "host" : "badHost" }
    request(url)
    .post('/playlist/spotify/getAll')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal ('error retriving user\'s playlists: '+validHostFail)
      res.status.should.equal(400);
      done();
    });
  });
})

describe('POST /guests/add', function(){
  it('successfully add a guest to the database ', function(done){
    postData = { "host" : "clay976",
                 "guestNum" : "6134539030" }
    request(url)
    .post('/guests/add')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.status.should.equal(200);
      done();
    });
  });
  it('fail to add a guest for missing host information', function(done){
    postData = { "guestNum" : "1234567890" }
    request(url)
    .post('/guests/add')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal('error adding guest: validation error: could not find this host in our database, You must log in to continue')
      res.status.should.equal(400);
      done();
    });
  });
  it('fail to add a guest for missing phone number information', function(done){
    postData = { "host" : "clay976" }
    request(url)
    .post('/guests/add')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal('error adding guest: no phone number recieved to add as a guest')
      res.status.should.equal(400);
      done();
    });
  });
  it('fail to add a guest for malformed phone number information', function(done){
    postData = { "host" : "clay976",
                 "guestNum" : "badnum" }
    request(url)
    .post('/guests/add')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal('error adding guest: number not the right length, please retry with the format "1234567890" (no speacial characters)')
      res.status.should.equal(400);
      done();
    });
  });
})
describe('POST /message', function(){
  it('send a message from a non-guest phone number, should be rejected', function(done){
    postData = { 
      "From"  : "+11432432",
      "Body"  : "non-guest request"
    }
    request(url)
    .post('/message')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.text.should.equal('error handling incoming message: sorry, we could not find a party that you are currently a guest of. Send the host\'s phone number in the format "1234567890" and we will ask them to add you')
      console.log (res.text)
      done();
    });
  });
  it('send a message from a guest, with drake as the search query', function(done){
    postData = { 
      "From"  : "+16134539030",
      "Body"  : "fireworks drake"
    }
    request(url)
    .post('/message')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.text.should.equal('<?xml version="1.0" encoding="UTF-8"?><Response><Message>We found: Fireworks, by: Drake. This Track has 0 requests!</Message></Response>')
      console.log (res.text)
      done();
    });
  });
  it('send a message from a guest, declining a preious request', function(done){
    postData = { 
      "From"  : "+16134539030",
      "Body"  : "no"
    }
    request(url)
    .post('/message')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.text.should.equal('<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry about the wrong song, try modifying your search! Remember to not use any special characters.</Message></Response>')
      console.log (res.text)
      done();
    });
  });
  it('send a message from a guest, with an empty request', function(done){
    postData = { 
      "From"  : "+16134539030",
      "Body"  : "yes"
    }
    request(url)
    .post('/message')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.text.should.equal('error handling incoming message: We don\'t have a request for you to confirm or decline. If your song is just "yes", or "no", add an artist name to search')
      console.log (res.text)
      done();
    });
  });
  it('send a message from a guest, with an empty request', function(done){
    postData = { 
      "From"  : "+16134539030",
      "Body"  : "no"
    }
    request(url)
    .post('/message')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.text.should.equal('error handling incoming message: We don\'t have a request for you to confirm or decline. If your song is just "yes", or "no", add an artist name to search')
      console.log (res.text)
      done();
    });
  });
  it('send a message from a guest, with drake as the search query', function(done){
    postData = { 
      "From"  : "+16134539030",
      "Body"  : "drake"
    }
    request(url)
    .post('/message')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }  
      console.log (res.text)
      done();
    });
  });
  it('send a message from a guest, confirming a request', function(done){
    postData = { 
      "From"  : "+16134539030",
      "Body"  : "yes"
    }
    request(url)
    .post('/message')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      //res.text.should.equal('error handling incoming message: We don\'t have a request for you to confirm or decline. If your song is just "yes", or "no", add an artist name to search')
      console.log (res.text)
      done();
    });
  });
  it('send a message from a guest, with a request that will not be found', function(done){
    postData = { 
      "From"  : "+16134539030",
      "Body"  : "fuieqgf8234078rhfew"
    }
    request(url)
    .post('/message')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      //res.body.should.equal('soung not found')
      console.log (res.text)
      done();
    });
  });
})*/