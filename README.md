# cg-promise
My own implementation of a Promise
# Installation
## Via npm
```
npm install --save cg-promise
```
## Via script tag
```
<script src="https://unpkg.com/cg-promise/dist/cg-promise.min.js"></script>
```
# Usage
## Node
```
var CGPromise = require('cg-promise');

var promise = new CGPromise(function (resolve, reject) {
  performAsyncOperation(function success(value) {
    resolve(value);
  }, function failure(error) {
    reject(error);
  });
});

promise.then(function (val) {
  console.log('resolved with value:', val);
}).catch(function (error) {
  console.log('rejected with error:', error);
});
```
## Browser
`CGPromise` is available as a global variable.
