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
var upsertTemplate = require ('../database/upsert/JSONtemps')

//variables
var url = 'localhost'
var validHostFail = 'validation error: could not find this host in our database, You must log in to continue'

/*BEFORE EACH RUN OF TESTS!!
use this url to retrieve a code so we can obtain access tokens
for the tests. 

https://accounts.spotify.com/authorize?response_type=code&client_id=a000adffbd26453fbef24e8c1ff69c3b&scope=user-read-private%20user-read-email%20user-read-birthdate%20streaming%20playlist-modify-private%20playlist-modify-public%20playlist-read-private&redirect_uri=http%3A%2F%2F104.131.215.55%3A80%2Fcallback

place the code in this next variable
*/
var code = 'AQCruidCKv3fW5WDvZ-jDdgXQEwcjuq_7Q3gpXaxYwPeVteRCkbJxZhxjwK0gliDACp14nKajvFn68MepA1kfEOImE8Hv5guaV5wyafAJZfXaEO-QGS-6OsOKEcscn6zMNB28UBXmSiIigmSoy_p4b_P1WLrW7o-lrru7qNbqEtxvmlIa7VxLaLxyecsKWhK65oj9DkMmhIgXNLk-i4Dz49qgvlOZ5gt-8vKb-R5VUnMZLw1TwETDSF48J9fd2i1WHN16-phfjVu92pyXiKw_xfNo_ixsEHdwYteRf830VjDEAaW6aggwNJwePDx1pcfrNhhjyMogADmbbnj1Q4_4cqM8Ay9tVqGAv6VjtD_XZuwg3n4SE6Wdvi84ZkcPZE4U2KZ'
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
      res.status.should.equal(302);
      done();
    });
  });
})

describe('GET /callback', function(){
  it('hit the callback enpoint with a valid authorization code. should be a redirect, to the hosts homepage.', function(done){
    request(url)
    .get('/callback?code='+code)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.status.should.equal(302);
      done();
    });
  });
  it('hit the callback enpoint with a bad authorization code. should be a redirect back to login.', function(done){
    request(url)
    .get('/callback?code=badcode')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res.body)
      res.body.should.equal('error loggin in: WebapiError: invalid_grant: Invalid authorization code');
      res.status.should.equal(400);
      done();
    });
  });
})

describe('POST /playlist/spotify/create', function(){
  // it('successfully create a spotify playlist', function(done){
  //   postData = {
  //     "playName"  : "mocha test",
  //     "host"      : "clay976"
  //   }
  //   request(url)
  //   .post('/playlist/spotify/create')
  //   .send (postData)
  //   .end(function(err, res) {
  //     if (err) {
  //       throw err;
  //     }
  //     console.log (res.body)
  //     res.body.should.equal ('playlist was created successfully')
  //     res.status.should.equal(200);
  //     done();
  //   });
  // });
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
})
describe('POST /playlist/spotify/set', function(){
  it('successfully set a playlist that the user owns', function(done){
    postData = {
      "playlistID"  : "0ktJLEaSUXtKIJPcRB2cK4",
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
      res.body.should.equal ('playlist has been set successfully')
      res.status.should.equal(200);
      done();
    });
  })
  it('try to set a playlist ID that the user does not own', function(done){
    postData = {
      "playlistID"  : "4VJ8BH056GfU5IdxVnaBNP",
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
                 "guestNum" : "1234567890" }
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
  it('send "yes" trying to confirm an empty request', function(done){
    postData = { "message.body" : "yes"}
    request(url)
    .post('/message')
    .send (postData)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      console.log (res)
      done();
    });
  });
  // it('fail to add a guest for missing phone number information', function(done){
  //   postData = { "host" : "clay976" }
  //   request(url)
  //   .post('/guests/add')
  //   .send (postData)
  //   .end(function(err, res) {
  //     if (err) {
  //       throw err;
  //     }
  //     console.log (res.body)
  //     res.status.should.equal(400);
  //     done();
  //   });
  // });
  // it('fail to add a guest for malformed phone number information', function(done){
  //   postData = { "host" : "clay976",
  //                "guestNum" : "badnum" }
  //   request(url)
  //   .post('/guests/add')
  //   .send (postData)
  //   .end(function(err, res) {
  //     if (err) {
  //       throw err;
  //     }
  //     console.log (res.body)
  //     res.status.should.equal(400);
  //     done();
  //   });
  // });
})