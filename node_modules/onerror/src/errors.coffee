module.exports =
  # Takes a callback function of the form `(result, ...) ->` and will convert it into the form `(err, result, ...) ->` where the `err` argument is thrown if it is set. 
  # This function returns the wrapped callback and can be used inline like `asyncFunction arg1, errors.throw (result) -> ...`.
  throw: (callback) ->
    return (err, args...) ->
      throw err if err?
      callback args...

  # Passes on the first argument if set to the `errorHandler` instead of to the `callback` function.
  # This lets you skip the `callback` function and pass the error up the callback chain.
  passTo: (errorHandler, callback) ->
    return (err, args...) ->
      return errorHandler(err) if err?
      callback args...
