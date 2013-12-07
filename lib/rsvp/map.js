import { Promise } from "./promise";
import { all } from "./all";
import { isArray, isFunction } from "./utils";

/**

 `RSVP.map` is similar to JavaScript's native `map` method, except that it
  waits for all promises to become fulfilled before running the `mapFn` on
  each item in given to `promises`. `RSVP.map` returns a promise that will
  become fulfilled with the result of running `mapFn` on the values the promises
  become fulfilled with.

  For example:

  ```javascript

  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.resolve(2);
  var promise3 = RSVP.resolve(3);

  var mapFn = function(item){
    return item + 1;
  };

  RSVP.map(promises, mapFn).then(function(result){
    // result is [ 2, 3, 4 ]
  });
  ```

  If any of the `promises` given to `RSVP.map` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.reject(new Error("2"));
  var promise3 = RSVP.reject(new Error("3"));
  var promises = [ promise1, promise2, promise3 ];

  var mapFn = function(item){
    return item + 1;
  };

  RSVP.map(promises, mapFn).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(reason) {
    // reason.message === "2"
  });
  ```

  @method map
  @for RSVP
  @param {Array} promises
  @param {Function} mapFn function to be called on each fulfilled promise.
  @param {String} label optional string for labelling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled with the result of calling
  `mapFn` on each fulfilled promise or vlaue when they become fulfilled.
   The promise will be rejected if any of the given `promises` become rejected.
*/
function map(promises, mapFn, label) {

  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to map.');
  }
  
  if (!isFunction(mapFn)){
    throw new TypeError("You must pass a function to map's second argument.");
  }

  return all(promises, label).then(function(results){
    var resultLen = results.length,
        result,
        mappedResults = [],
        i;

    for (i = 0; i < resultLen; i++){
      mappedResults.push(mapFn(results[i]));
    }

    return mappedResults;
  });
}

export { map };
