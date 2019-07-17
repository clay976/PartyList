module.exports = function (res, err){
	console.log (err)
	if (!err.statusCode) err.statusCode = 400
	if (err.stack) console.log (err.stack)
	else console.log ("No stack on this error")
	res.status(err.statusCode).json ('error: '+err)
}