/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
var fs = require('fs');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var assert = require('assert');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var client_id = 'a000adffbd26453fbef24e8c1ff69c3b'; // Your client id
var client_secret = '899b3ec7d52b4baabba05d6031663ba2'; // Your client secret
var redirect_uri = 'http://89549b9a.ngrok.io/callback'; // Your redirect uri

//var message = require('./node_modules/twilio/examples/example.js');
//var twilio = require('twilio');
var insert = require ('./databasetools/insert');
var query = require ('./databasetools/querydb');
var update = require ('./databasetools/update');
var validateToken = require ('./databasetools/checkToken');
var host;

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = 'mongodb://localhost:27017/party';
var playlistID;


  MongoClient.connect(mongoUrl, function(err, db) {
    assert.equal(null, err);

  /**
   * Generates a random string containing numbers and letters
   * @param  {number} length The length of the string
   * @return {string} The generated string
   */
  console.log ('starting server');
  var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  var stateKey = 'spotify_auth_state';

  app.use(express.static(__dirname + '/public'))
     .use(cookieParser());

  app.get('/login', function(req, res) {
    console.log ('loging in');
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email user-read-birthdate streaming playlist-modify-private playlist-modify-public playlist-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });
  app.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
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

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          
          var access_token = body.access_token,
            refresh_token = body.refresh_token

          //databasecalls to save access and refresh tokens in the partyList collection
          // unser the tokens document

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };

          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {

            //database call to save the tokens and user id as a host collection document
            host = (body.id).toString();
            console.log ('searching for ' + host);
            var docuInsert = insert.apiInfo (host,access_token, refresh_token);
            var found;

            query.search (host, {'host':host}, db, function(found){ 
              if (found != null){
                console.log ('found existing user');
                // found host so we will update their tokens to access api
                var updateInfo = update.bothTokens (access_token, refresh_token);
                update.updater (host, found, updateInfo,db, function(error){
                  console.log ('updated the info');
                  query.search (host, {'host':host}, db, function(found){ 
                    if (found != null){
                      console.log (found.access_token);
                    }
                  });
                });

              }else{
                console.log ('creating new user');
                insert.insert (host, docuInsert, db, function (result){
                  console.log("Inserted a document into the" +collect+ " collection.");
                  console.log (result);
                });
              };
            });
          });

          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        } 
        else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      })
    }
  });

  app.get('/refresh_token', function refreshToken (req, res) {

    // requesting access token from refresh token
    doc = query.findHost (host);
    var refresh_token;
    query.search (host,doc, db, function(docum){
      refresh_token = docum.refresh_token;
      console.log (refresh_token);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        var documUpdate = update.findHost (host); 
        var updateInfo = update.accessToken (access_token);

        update.updater (host, documUpdate, updateInfo,db, function(error){
          console.log ('updated the access token:');
          query.search (host, {'host':host}, db, function(found){ 
            if (found != null){
              console.log (found.access_token);
            }
          });
        });

        res.send({
          'access_token': access_token
        });
      }
    })
    });
  });

  app.post('/createPlaylist', function(req, res){
    playlistname = req.body.playName;
    if (playlistname) {
      console.log('creating: ' + playlistname);  
    }else{
      console.log('Please enter a playlist name!');
    }
    
    //database casll to obtain access token, if access token is expired then
    //obtain new access token by using refresh token
    validateToken.checkToken (host, db, function(tokenValid, docFound){
    var options = {
      url: 'https://api.spotify.com/v1/users/' +host+ '/playlists',
        body: JSON.stringify({
          'name': playlistname,
          'public': false
        }),
        dataType:'json',
        headers: {
          'Authorization': 'Bearer ' + docFound.access_token,
          'Content-Type': 'application/json',
        }
      };
    request.post(options, function(error, response, body) {
      console.log ('creating playlist');
      playlist = JSON.parse (body);
      playlistID = playlist.id
      console.log (playlistID);
    });
    res.send({
              playlist: 'playlist created'
            });
    });
  });

  app.post('/findPlaylist', function(req, res){
  var options = {
    url: 'https://api.spotify.com/v1/users/' + user.id + '/playlists',
    headers: {'Authorization': 'Bearer ' +(opts.access_token)}
    };

    var r = request.get(options, function(error, response, body) {
      console.log ('finding playlist');
      if (error) {
        console.log ('noodle');
      }
    }).pipe(fs.createWriteStream('playlists.json', 'w'))

    r.on('finish', function () {
      playlistINFO = require ('./playlists.json');

    playlistID = playlistINFO.items[0].id;
    console.log (playlistID);
    });

  });

  app.post('/message', function(req, res){
    var searchParam = req.body.Body;
    var trackID;
    var trackTitle;
    var trackFind;
    //message.message ("I LOVE NOODLES");
    var options = {
      url: 'https://api.spotify.com/v1/search?q=' +searchParam+ '&type=track&limit=1'
    };

    request.get(options, function(error, response, body) {
      console.log (body);
      if (error) {
        console.log ('noodle');
      }
      
      trackAdd = JSON.parse(body);
      if ((trackAdd.tracks.total)>0){
        trackID =trackAdd.tracks.items[0].id;
        console.log (trackID);
        console.log (playlistID);
        console.log (host);

        trackTitle = trackAdd.tracks.items[0].name;
        console.log (trackTitle);
        //insert.insert ('trackListing', trackAdd);
        //trackFind = query.findTrack ()
        //query.search (host, {'host':host}, db, function(found){

        console.log ('adding '+ trackTitle+ ' by ');
        validateToken.checkToken (host, db, function(tokenValid, docFound){

          var options = {
            url: "https://api.spotify.com/v1/users/" +host+ "/playlists/"+playlistID+ "/tracks",
            body: JSON.stringify({"uris": ["spotify:track:"+trackID]}),
            dataType:'json',
              headers: {
              Authorization: "Bearer " + docFound.access_token,
              "Content-Type": "application/json",
            }
          };
          console.log (options);
          request.post(options, function(error, response, body) {
            console.log (error);
            console.log (body);
            playlist = JSON.parse (body);

          });
        });
      };
    });
  });
  app.listen(8888);
  setInterval(function refreshToken (req, res) {

    // requesting access token from refresh token
    doc = query.findHost (host);
    var refresh_token;
    query.search (host,doc, db, function(docum){
      refresh_token = docum.refresh_token;
      console.log (refresh_token);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        var documUpdate = update.findHost (host); 
        var updateInfo = update.accessToken (access_token);

        update.updater (host, documUpdate, updateInfo,db, function(error){
          console.log ('updated the access token:');
          query.search (host, {'host':host}, db, function(found){ 
            if (found != null){
              console.log (found.access_token);
            }
          });
        });
      }
    })
    });
  },3540000 );
});