var should = require('should')
var assert = require('assert')
var request = require('supertest')
var url = '104.131.215.55'

describe('GET /guests/add', function(){
  it('add a guest to the database', function(done){
    var guestNum = '1234567890'
    request(url)
    .post('/guests/add?'+guestNum)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      // this is should.js syntax, very clear
      res.should.have.status(400);
      done();
    });
  });
})

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