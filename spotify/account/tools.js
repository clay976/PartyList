//node modules
var querystring = require('querystring')
var request = require('request') // "Request" library

//my modules
var tools = require ('../generalTools/tools')
var insert = require ('../databasetools/insert')
var query = require ('../databasetools/querydb')
var update = require ('../databasetools/update')
var dbTools = require ('../databasetools/abstractTools')
var makeJSON = require ('../JSONobjects/makeJSON')

//other variables
var stateKey = 'spotify_auth_state'

// this is what the user will see when they click login for the first
// time, it tells them what our app will be allowed to access
// and provides the location of where the app will go after login
// with the redirect URI.
// the state is what will be checked by the app when
// we are trying to make calls afterward to make sure
// they are still logged in
function login (req, res) {
  var state = tools.generateRandomString(16)
  res.cookie(stateKey, state)
  res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify(makeJSON.buildScope(state)))
}

// this will prepare the JSON object with our applications
// authorization tokens for the spotify API.
// requests refresh and access tokens for the user
// after checking the state parameter
function homepage (req, res, db, callback) {
  var code = req.query.code || null
  if (state === null || state !== storedState) {
    res.redirect('/' +querystring.stringify({error: 'state_mismatch'}))
  }else{
    res.clearCookie(stateKey)
    var authOptions = makeJSON.authForTokens (code)
    callback (res, db, authOptions, getHostInfo)
  }
}

// makes a request to the spotify API to retrieve
// the access and refresh tokens for the user
// preps them in to an "options" object to
// make another call for host info
function retrieveAndPrepTokens (res, db, authOptions, callback) {
  request.post(authOptions, function (error, response, body){
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token
      var refresh_token = body.refresh_token
      var options = makeJSON.getHostInfo (access_token)
      callback (res, db, options, access_token, refresh_token, dbTools.UOIHost)
    }else{
      res.redirect (403, '/')
      console.log (error)
    }
  })
}

// makes another request to the spotify API to
// obtain the rest of the host information and
// calls the insertOrUpdate function to find them
// and update them or straight insert them
function getHostInfo (res, db, options, access_token, refresh_token, callback) {
  request.get(options, function (error, response, body){
    if (error){
      console.log (error)
      loginRedirect (res, 500, error)
    }else{
      host = (body.id).toString()
      docuSearch = query.findHost (host)
      callback (res, db, host, docuSearch, access_token, refresh_token)
      //database call to save the tokens and user id as a host collection document
    }
  })
}

function loginRedirect (res, code, message){
  console.log (message)
  res.redirect ('/'+code)
}

function homePageRedirect (res, statusCode, message){
  console.log (message)
  res.send (statusCode, message)
}

function refreshToken () {
  var refresh_token
  query.search (host,doc, db, function (docum){
    refresh_token = docum.refresh_token
    request.post(makeJSON.accessFromRefresh(refresh_token), function (error, response, body) {
      if (!error && response.statusCode === 200) {
        update.updater (host, query.findHost (host), update.accessToken (body.access_token),db, function (error){
          console.log ('updated the access token')
        })
      }
    })
  })
}

function checkToken (host, db, callback){
  query.search (host, {'host':host}, db, function(found){ 
    if (found != null){
        callback (true, found)
    }else{
      console.log ('the user has not logged in properly')
      callback (false, null)
    }
  })
}

//exports for external modules to use.
module.exports = {
  login: login,
  homepage: homepage,
  retrieveAndPrepTokens: retrieveAndPrepTokens,
  getHostInfo: getHostInfo,
  loginRedirect: loginRedirect,
  homePageRedirect: homePageRedirect,
  checkToken: checkToken
}