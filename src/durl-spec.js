

var chai = require('chai'),
    should = require('chai').should(),
    expect = require('chai').expect(),
    Durl = require('../src/durl');

// TODO this mock is getting to elaborate, surely theres
// another framework to get true windows and such.
window = {
  lastMessage: undefined,
  postMessage: function(msg, origin){
    window.lastMessage = msg
    window.lastOrgin = origin
  },
  addEventListener: function(event, handler){
    window.eventListener = {
      event: event,
      handler: handler
    }
  },
  document: {
    body: {
      onhashchange: {}
    }
  }
}

describe('Durl', function() {
  beforeEach(function(){
    
    pmb = new PostMassage({
      window: window,
      namespace: 'foobar',
      logging: true,
      addListener:false
    })
  })

  it('should be tested more', function() {
    test = new Durl({
      postMassage: pmb
    })
    chai.expect(false).equal(true)
  })
})