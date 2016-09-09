var search = require ('./query/search')
var queryTemplate = require ('./query/JSONtemps')
var upsertTemplate = require ('./upsert/JSONtemps')
var model = require ('./models')

function addManyGuest (req, res, db){
  var body = JSON.parse(req)
  var host = body.host
  var nums = body.guestNums
  var count = nums.length
  for (var i = 0; i < count; i++) {
    addGuest (res, db, host, nums[i])
  }
}

function addGuest (req, res, db){ 
  if (req.body.guestNum.length === 10){
    model.Guest.findOneAndUpdate({phoneNum: req.body.guestNum},upsertTemplate.Guest (req.body.host, req.body.guestNum)).exec()
    .then (function (guestInfo){
      res.status(200).send ('guest added succsefully')
    })
    .catch (function(err) {
      res.status(400).send ('sorry something went wrong: '+ err.message)
      console.log('Something went wrong: ', err.message);
    })
  }else{
    res.status(400).send('number recieved not in the right format, please retry with the format "1234567890" (no speacial characters)')
  }
}

function resetGuest (db, guest2Find){
}

function validateGuest (body){
  return new Promise (function (fulfill, reject){
    var guestInfo = model.Host.findOne({ 'phoneNum' : body.From }).exec()
    .then (function (guestInfo){
      console.log (guestInfo)
      if (guestInfo.hostID){
        guestInfo.lastMessage = (body.Body).toLowerCare()
        fulfill (guestInfo) 
      }else{
        reject ('could not find this document in our database, this may be a problem on our end, sorry!')
      }
    })
  })
}

module.exports = {
  addManyGuest : addManyGuest,
  resetGuest: resetGuest,
  addGuest: addGuest,
  validateGuest: validateGuest
}