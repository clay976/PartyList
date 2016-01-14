//message respopnse handler

console.log("tring to send message"); 
if (!err) { // "err" is an error received during the request, if any
  console.log(responseData.body); // outputs the body of the twilio response
}else{
  console.log ("error sending message back");
  console.log (err);
};