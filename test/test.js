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
      res.status.should.equal(200);
      done();
    });
  });
})