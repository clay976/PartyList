//node modules
var express 				= require('express')
var bodyParser              = require('body-parser')

//app modules


//app definitions
var router = express.Router()

//middleware
router.use(bodyParser.json())// for parsing application/json
      .use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/*
remove the entire list of songs in our db for this user
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
router.post('/removeAll', function (req, res){
	//removeList.songs (res, db, req.body.hostID)
})

module.exports = router