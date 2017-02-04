//$set:{ "playlistID": ID }
//$set: { "currentTrack": trackID }

function guestConfirm(){
  return ({
    $inc: { numRequests: -1},
    $set: { "currentTrack": "" }
  }) 
}

//update api info functions
function bothTokens (aToken, rToken){
  var d = new Date()
  time = d.getTime()
  return ({ 
    "access_token": aToken,
    "refresh_token": rToken,
    "time": time
  }) 
}
function accessToken (aToken){
  var d = new Date()
  time = d.getTime()
  return ({$set:{ 
    "access_token": aToken,
    "time": time 
  }}) 
}
module.exports = {
  guestConfirm: guestConfirm,
  tracksReqd: tracksReqd,
  bothTokens: bothTokens,
  accessToken: accessToken
}