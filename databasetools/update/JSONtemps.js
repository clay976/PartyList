//update playlist document
function playlistID (ID){
  return ({
    $set:{ "playlistID": ID }
  }) 
}

//update guests functions
function guestRequest (trackID){
  return ({
    $set: { "currentTrack": trackID }
  }) 
}

function guestConfirm(){
  return ({
    $inc: { numRequests: -1},
    $set: { "currentTrack": "" }
  }) 
}

function guestReset(){
  return ({
    $set: { numRequests: 4}
  }) 
}

//update tracks function 
function tracksReqd (){
  return ({
    $inc: { numRequests: 1}
  }) 
}

//update api info functions
function bothTokens (aToken, rToken){
  var d = new Date()
  time = d.getTime()
  return ({$set:{ 
    "access_token": aToken,
    "refresh_token": rToken,
    "time": time
  }}) 
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
  playlistID: playlistID,
  guestRequest: guestRequest,
  guestConfirm: guestConfirm,
  guestReset: guestReset,
  tracksReqd: tracksReqd,
  bothTokens: bothTokens,
  accessToken: accessToken,
  updater: updater,
  responseHandler: responseHandler
}