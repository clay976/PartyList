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
    var num = '+1'+req.body.guestNum
    console.log (num)
    model.Guest.findOneAndUpdate({'phoneNum': num},upsertTemplate.Guest (req.body.host, num), {upsert:true}).exec()
    .then (function (guestInfo){
      console.log (guestInfo)
      res.status(200).send ('guest added succsefully')
    })
    .catch (function(err) {
      console.log('Something went wrong: ', err.message);
      res.status(400).send ('sorry something went wrong: '+ err.message)
    })
  }else{
    res.status(400).send('number recieved not in the right format, please retry with the format "1234567890" (no speacial characters)')
  }
}

function resetGuest (db, guest2Find){
}

function validateGuest (body){
  console.log (body)
  return new Promise (function (fulfill, reject){
    model.Guest.findOne({ 'phoneNum' : body.From }).exec()
    .then (function (guestInfo){
      if (guestInfo){
        console.log ('guestJSON: ' +guestInfo)
        guestInfo.lastMessage = (body.Body).toLowerCase()
        fulfill (guestInfo) 
      }else{
        console.log ('could not find this document in our database, this may be a problem on our end, sorry!')
        reject ('could not find this document in our database, this may be a problem on our end, sorry!')
      }
    })
    .catch (function (err){
      //respond
      console.log ('validating guest failed' +err.stack)
    })
  })
}

module.exports = {
  addManyGuest : addManyGuest,
  resetGuest: resetGuest,
  addGuest: addGuest,
  validateGuest: validateGuest
}