/*
This function validates the phone number of a guest.
Currently this only checks length, but could also check 
for other parameters such as area code or mod check.
*/
module.exports = function validatePhoneNumber (requestObject){
  return new Promise (function (fulfill, reject){
    if (requestObject.guestToAdd){
      if (requestObject.guestToAdd.length === 12) {
        fulfill (requestObject)
      }else{
        reject ({
          statusCode  : 400,
          stack       : 'services/guest/tools/validatePhoneNumber',
          message     : 'number not the right length, please retry with the format "1234567890" (no speacial characters)'
        })
      }
    }else{
      reject ({
        statusCode  : 400,
        stack       : 'services/guest/tools/validatePhoneNumber',
        message     : 'no phone number recieved to add as a guest'
      })
    }
  })
}