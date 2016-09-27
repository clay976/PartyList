var queryTemplate = require ('./query/JSONtemps')
var upsertTemplate = require ('./upsert/JSONtemps')
var model = require ('./models')
var hostAcountTools = require ('../spotify/account/tools')

function addManyGuest (req, res){
  var body = JSON.parse(req)
  var nums = body.guestNums
  var count = nums.length
  for (var i = 0; i < count; i++) {
    addGuest (res, db, body.host, nums[i])
  }
}

function addGuest (req, res){
  hostAcountTools.validateHost (req.body.host)
  .then (validateRequest(req))
  .then (model.Guest.findOneAndUpdate({'phoneNum': '+1'+req.body.guestNum}, upsertTemplate.Guest (req.body.host, '+1'+req.body.guestNum), {upsert:true}).exec())
  .then (res.status(200).json ('guest added succsefully'))
  .catch (function (err){
    res.status(400).json('error: '+err)
  })
}

function validateRequest (req){
  return new Promise (function (fulfill, reject){
    if (req.body.guestNum){
      if (req.body.guestNum.length === 10){
        fulfill ()
      }else {
        reject ('number not the right length, please retry with the format "1234567890" (no speacial characters)')
      }
    }else{
      reject ('no phone number recieved to add as a guest')
    }
  })
}

function validateGuest (body){
  return new Promise (function (fulfill, reject){
    model.Guest.findOne({ 'phoneNum' : body.From }).exec()
    .then (function (guestInfo){
      if (guestInfo){
        console.log ('guestJSON: ' +guestInfo)
        guestInfo.lastMessage = (body.Body).toLowerCase()
        fulfill (guestInfo) 
      }else reject ('we could not find you listed as a guest in anyone\'s part, sorry!')
    })
    .catch (function (err){
      reject ('validating guest failed' +err.stack)
    })
  })
}

module.exports = {
  addManyGuest : addManyGuest,
  addGuest: addGuest,
  validateGuest: validateGuest
}