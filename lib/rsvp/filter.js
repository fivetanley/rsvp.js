import { all } from "./all";
import { isFunction, isArray } from "./utils";

/**
 `RSVP.filter` is similar to JavaScript's native `filter` method, except that it
  waits for all promises to become fulfilled before running the `filterFn` on
  each item in given to `promises`. `RSVP.filterFn` returns a promise that will
  become fulfilled with the result of running `filterFn` on the values the
  promises become fulfilled with.

  For example:

  ```javascript

  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.resolve(2);
  var promise3 = RSVP.resolve(3);

  var filterFn = function(item){
    return item > 1;
  };

  RSVP.filter(promises, filterFn).then(function(result){
    // result is [ 2, 3 ]
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

  var filterFn = function(item){
    return item > 1;
  };

  RSVP.map(promises, mapFn).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(reason) {
    // reason.message === "2"
  });
  ```

  `RSVP.filter` will also wait for any promises returned from `filterFn`.
  For instance, you may want to fetch a list of users then return a subset
  of those users based on some asynchronous operation:

  ```javascript

  var alice = { name: 'alice' };
  var bob   = { name: 'bob' };
  var users = [ alice, bob ];

  var promises = users.map(function(user){
    return RSVP.resolve(user);
  });

  var filterFn = function(user){
    // Here, Alice has permissions to create a blog post, but Bob does not.
    return getPrivilegesForUser(user).then(function(privs){
      return privs.can_create_blog_post === true;
    });
  };
  RSVP.filter(promises, filterFn).then(function(users){
    // true, because the server told us only Alice can create a blog post.
    users.length === 1;
    // false, because Alice is the only user present in `users`
    users[0] === bob;
  });
  ```

  @method filter
  @for RSVP
  @param {Array} promises
  @param {Function} filterFn - function to be called on each resolved value to
  filter the final results.
  @param {String} label optional string describing the promise. Useful for
  tooling.
  @return {Promise}
*/
function filter(promises, filterFn, label) {
  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to filter.');
  }
  
  if (!isFunction(filterFn)){
    throw new TypeError("You must pass a function to filter's second argument.");
  }

  return all(promises, label).then(function(results){
    var resultsLen = results.length,
        i,
        filteredResults = [],
        filteredResult,
        hasPromises = false,
        result;

    for(i = 0; i < resultsLen; i++){
      result = results[i];
      if (result instanceof FilterResult) {
        if (result.returnedSuccessfully){
          filteredResults.push(result.value);
        }
      }
      else if (filteredResult = filterFn(result)) {
        if (typeof filteredResult ==='object' && isFunction(filteredResult.then)){
          hasPromises = true;
          result = FilterResult.fromFilterPromise(filteredResult, result);
        }
        filteredResults.push(result);
      }
    }

    if (hasPromises){
      return filter(filteredResults, filterFn, label);
    }
    return filteredResults;
  });
}

/**
 @private
*/
function FilterResult(value, returnedSuccessfully){
  this.value = value;
  this.returnedSuccessfully = (!!returnedSuccessfully);
}

FilterResult.fromFilterPromise = function(promise, originalValue){
  return promise.then(function(value){
    return new FilterResult(originalValue, value);
  });
};

export { filter };
