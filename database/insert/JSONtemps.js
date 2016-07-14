function guest (host,phoneNum){
  return{
    "host": host,
    "phone":phoneNum,
    numRequests:4,
    "currentTrack":""
  }
}

function track (trackID){
  return{ 
    "trackId":trackID,
    numRequests:1,
    timePlayed:0 
  }
}

function apiInfo (host, access, refresh){
  return{
    "host":host,
    "clientId": "000adffbd26453fbef24e8c1ff69c3b",
    "clientSecret" : "899b3ec7d52b4baabba05d6031663ba2",
    "redirectUri" : "http://localhost:80/callback",
    "access_token":access,
    "token_type":"Bearer",
    expires_in:3500000,
    "refresh_token": refresh,
    "playlistID":"",
    "tracks":[]
  }
}

module.exports = {
  guest: guest,
  track: track,
  apiInfo: apiInfo
}