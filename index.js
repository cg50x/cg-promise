function Promise(cb) {
  var status = 'none';
  var payload = null;
  var thenCallbacks = [];
  var errCallbacks = [];

  setTimeout(function () {
    cb(resolve, reject);
  });

  this.then = then;
  this.catch = _catch;

  function reject(err) {
    if (status !== 'none') {
      return;
    }
    status = 'rejected';
    payload = err;
    errCallbacks.forEach(function (cb) {
      cb(payload);
    });
  }

  function resolve(val) {
    if (status !== 'none') {
      return;
    }
    status = 'resolved';
    payload = val;
    thenCallbacks.forEach(function (cb) {
      cb(payload);
    });
  }
  
  function then(cb) {
    // resolve with the value immediately
    // or add it to a list of callbacks which will get called later
    if (status === 'resolved') {
      return new Promise(function (resolve, reject) {
        var thenCb = getAction(resolve, reject, cb);
        thenCb(payload);
      });
    } else if (status === 'rejected') {
      return new Promise(function (resolve, reject) {
        reject(payload);
      });
    } else {
      return new Promise(function (resolve, reject) {
        var thenCb = getAction(resolve, reject, cb);
        thenCallbacks.push(thenCb);
        errCallbacks.push(function () {
          reject(payload);
        });
      });
    }
  }

  function _catch(cb) {
    // resolve with the value immediately
    // or add it to a list of callbacks which will get called later
    if (status === 'rejected') {
      return new Promise(function (resolve, reject) {
        var errCb = getAction(resolve, reject, cb);
        errCb(payload);
      });
    } else if (status === 'resolved') {
      return new Promise(function (resolve) {
        resolve(payload);
      });
    } else {
      return new Promise(function (resolve, reject) {
        var errCb = getAction(resolve, reject, cb);
        errCallbacks.push(errCb);
        thenCallbacks.push(function () {
          resolve(payload);
        });
      });
    }
  }
  
  function getAction(resolve, reject, cb) {
    return function (newPayload) {
      try {
        var result = cb(newPayload);
        if (result instanceof Promise) {
          result.then(resolve);
          result.catch(reject);
        } else {
          resolve(result);
        }
      } catch (err) {
        reject(err);
      }
    };
  }
}

Promise.resolve = function (value) {
  return new Promise(function (resolve) {
    resolve(value);
  });
};

Promise.reject = function (error) {
  return new Promise(function (resolve, reject) {
    reject(error);
  });
};

Promise.all = function (promises) {
  promises = promises || [];
  return new Promise(function (resolve, reject) {
    // Waiting until all results to complete
    var results = new Array(promises.length);
    var numComplete = 0;
    promises.forEach((promise, index) => {
      promise.then((val) => {
        results[index] = val;
        numComplete += 1;
        if (numComplete === promises.length) {
          resolve(results);
        }
      });
    });
    // If any of them error out, reject the promise.
    promises.forEach((promise) => {
      promise.catch(function (err) {
        reject(err);
      });
    });
  });
};


function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

delay(2000).then(function () {
  console.log('1');
  return delay(2000);
}).then(function () {
  console.log('2');
  return delay(2000);
}).then(function () {
  console.log('3');
});