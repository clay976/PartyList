var twilio = require('twilio');
http = require('http');

module.exports.message = function(toNum,body){
  return({
    to: toNum,
    from:"+12892161101",
    body:body
  })
};