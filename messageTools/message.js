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
function sentHandler (err, responseData){
  if (err) {
    console.log (err)
    console.log ("error sending message back")
  }
}

module.exports = {
  message: message,
  sentHandler: sentHandler
}
