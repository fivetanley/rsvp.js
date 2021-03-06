var local = (typeof global === "undefined") ? this : global;

/**
  `RSVP.rethrow` will rethrow an error on the next turn of the JavaScript event
  loop in order to aid debugging.

  Promises A+ specifies that any exceptions that occur with a promise must be
  caught by the promises implementation and bubbled to the last handler. For
  this reason, it is recommended that you always specify a second rejection
  handler function to `then`. However, `RSVP.rethrow` will throw the exception
  outside of the promise, so it bubbles up to your console if in the browser,
  or domain/cause uncaught exception in Node. `rethrow` will throw the error
  again so the error can be handled by the promise.

  ```javascript

  function throws(){
    throw new Error('Whoops!');
  }

  var promise = new RSVP.Promise(function(resolve, reject){
    throws();
  });

  promise.fail(RSVP.rethrow).then(function(){
    // Code here doesn't run because the promise became rejected due to an
    // error!
  }, function (err){
    // handle the error here
  });

  ```

  The 'Whoops' error will be thrown on the next turn of the event loop
  and you can watch for it in your console. You can also handle it using a
  rejection handler given to `.then` or `.fail` on the returned promise.

  @method rethrow
  @for RSVP
  @param {Error} reason reason the promise became rejected.
  @throws Error
*/
function rethrow(reason) {
  local.setTimeout(function() {
    throw reason;
  });
  throw reason;
}

export { rethrow };
