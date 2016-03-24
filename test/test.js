var assert = require('assert')

describe('test building JSON object to send message with twilio', function(){
  it('should return a properly built message with body as "hello"', function(){
  	var tool = require ('../messageTools/message')
  	var number = '+01234567890'
  	var body = 'hello'
  	var mess = tool.message (number, body)

  	console.log (mess)
    assert.equal (mess.to, number)
    assert.equal (mess.body, body)
  })

  it('should return the message object as an error string instead of a JSON object', function(){
  	var tool = require ('../messageTools/message')
  	var mess = tool.message ()

  	console.log (mess)
    assert.equal (mess, 'error, parameters incorrect for message object')
  })
})