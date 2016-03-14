var twilio = require('twilio')
http = require('http')

module.exports.message = function(toNum,body){
  return({
    to: toNum,
    from:"+12892161101",
    body:body
  })
}

//message respopnse handler
module.exports.sentHandler = function(err, responseData){
  if (!err) { // "err" is an error received during the request, if any
    console.log(responseData.body) // outputs the body of the twilio response
  }else{
    console.log ("error sending message back")
    console.log (err)
  }
}
