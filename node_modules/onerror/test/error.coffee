expect = require 'expect.js'
errors = require '../src/errors'

describe 'errors.throw', ->
  it 'should throw the first argument to the callback if it exists', (done) ->
    callback = errors.throw (result) -> expect().fail 'Callback should not have been invoked when an error was passed.'
    try
      thrownError = new Error
      callback(thrownError)
    catch error
      expect(error).to.equal thrownError
      done()

  it 'should pass through all arguments but the first if the callback is successful', (done) ->
    callback = errors.throw (result1, result2, result3) ->
      expect(result1).to.eql 1
      expect(result2).to.eql 2
      expect(result3).to.eql 3

    callback null, 1, 2, 3
    done()

describe 'errors.passTo', ->
  it 'should invoke the handler with the error instead of the callback', (done) ->
    thrownError = new Error

    handler = (err) ->
      expect(err).to.equal thrownError
      done()
    
    callback = errors.passTo handler, (result) ->
      expect().fail 'Callback invoked instead of error handler'

    callback thrownError