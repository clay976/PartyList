//MODULES_____________________________________________________

//VARIABLES_____________________________________________________
var scope = 'user-read-private user-read-email user-read-birthdate streaming playlist-modify-private playlist-modify-public playlist-read-private'
var client_id = 'a000adffbd26453fbef24e8c1ff69c3b'
var client_secret = '899b3ec7d52b4baabba05d6031663ba2' // Your client secret
var redirect_uri = 'http://104.131.215.55:80/callback'

function buildScope (){
  return {
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri
  }
}

function authForTokens (code){
  return {
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
  }
}

function getHostInfo (access_token){
   return {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  }
}

function accessFromRefresh (refresh_token){
  return {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  }
}

module.exports = {
  buildScope: buildScope,
  authForTokens: authForTokens,
  getHostInfo: getHostInfo,
  accessFromRefresh: accessFromRefresh

}