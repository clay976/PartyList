//node modules
var express 				= require('express')
var bodyParser              = require('body-parser')

//app modules
var HandleIncomingMessage          = require ('services/twilio/HandleIncomingMessage')

//app definitions
var router                  = express.Router()

//middleware
router.use(bodyParser.json())// for parsing application/json
      .use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// this should have middleware that twilio provides to ensure only be coming from Twilio unless in test env.
router.post('/', function (req, res){
	var requestObject = {}
	requestObject.guestPhoneNumber  = req.body.From
	requestObject.guestMessage  	= req.body.Body.toLowerCase().trim()
	HandleIncomingMessage (requestObject, res)
})

module.exports = router