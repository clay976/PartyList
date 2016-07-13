function message (toNum,body){
  if (toNum && body){
    return({
      to: toNum,
      from:'+15878033620',
      body:body
    })
  }else{
    return ('error, parameters incorrect for message object')
  }
}

//message respopnse handler
function sentHandler (err, responseData){
  if (!err) { // "err" is an error received during the request, if any
    console.log('message sent succesfully') // outputs the body of the twilio response
  }else{
    console.log (err)
    console.log ("error sending message back")
  }
}

module.exports = {
  message: message,
  sentHandler: sentHandler
}
