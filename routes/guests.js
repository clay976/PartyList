//node modules
var express                 = require('express')
var bodyParser              = require('body-parser')

//app modules
var model                   = require ('database/models')

var addGuest                = require ('services/guest/add')
var getAll            = require ('services/guest/getAll')

//app definitions
var router          = express.Router()

//middleware
router.use(bodyParser.json())// for parsing application/json
      .use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/*
add a single guest to the party in a JSON block
___________________________________________________________________
TO BE SENT:
  JSON from req.body{  :  type  :              Description                |
    host               : string :  the username of their spotify account. |
    guestNum           : string : phone number of the guest to be added   |
  }
_______________________________________________________________________*/
  router.post('/getAll', function (req, res){
    var requestObject = {}
    requestObject.spotifyID = req.body.hostID
    requestObject.guestToAdd = '+1'+req.body.guestNum
    getAll (requestObject, res)
  })


/*
remove every guest that is associated with this user
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________
  router.post ('/removeAll', function (req, res){
    removeList.guests (res, db, req.body.hostID)
  })*/

/*
remove a guest that is associated with this user
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  router.post ('/remove', function (req, res){
    model.Guest.findOneAndUpdate({'phoneNum': '+1'+req.body.guestNum}, {'hostID': null}).exec()
    .then (function (update){
      res.json ('guest removed from party')
    })
    .catch (function (err){
      res.json (err)
    })
  })

/*
add many guests to the party in a JSON block
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{                     :  type  :              Description                |
    host                                  : string :  the username of their spotify account. |
    guestNums [ 1234567890, 
                4169834260                : array  :  phone numbers of the guest to be added |
              ]   
  }
_______________________________________________________________________________________*/
  router.post('/addMany', function (req, res){
    guestTools.addManyGuest (req, res, db)
  })


/*
add a single guest to the party in a JSON block
___________________________________________________________________
TO BE SENT:
  JSON from req.body{  :  type  :              Description                |
    host               : string :  the username of their spotify account. |
    guestNum           : string : phone number of the guest to be added   |
  }
_______________________________________________________________________*/
  router.post('/add', function (req, res){
    var requestObject = {}
    requestObject.spotifyID = req.body.hostID
    requestObject.guestToAdd = '+1'+req.body.guestNum
    addGuest (requestObject, res)
  })

  module.exports = router