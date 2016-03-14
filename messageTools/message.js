function message (toNum,body){
  return({
    to: toNum,
    from:"+12892161101",
    body:body
  })
}

//message respopnse handler
function sentHandler (err, responseData){
  if (!err) { // "err" is an error received during the request, if any
    console.log(responseData.body) // outputs the body of the twilio response
  }else{
    console.log ("error sending message back")
    console.log (err)
  }
}

module.exports = {
  message: message,
  sentHandler: sentHandler
}
