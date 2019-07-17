//node modules
var express 				= require('express')

//app modules
var generalLoginHandler    	= require ('services/login/generalHandler')
var spotifyLoginHandler    	= require ('services/spotify/account/loginHandler')

//app definitions
var router 					= express.Router()

//middleware

/*
login enpoint redirects to correct server, currently only spotify.
*/
router.get('/', function (req, res){
	generalLoginHandler (req, res)
})

/*
log the user in to access the rest of our things, and to save their access and refresh tokens
________________________________________________________________________________________
TO BE SENT:
JSON from req.body{               :  type  :              Description                      |
code                              : string :  the authorization code revieced from spotify |
}
_____________________________________________________________________________________________*/
router.get('/callback', function (req, res){
	spotifyLoginHandler (req.query.code, res)
})

module.exports = router