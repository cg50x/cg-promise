(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.CGPromise = factory());
}(this, (function () { 'use strict';

var Status;
(function (Status) {
    Status[Status["Rejected"] = 0] = "Rejected";
    Status[Status["Resolved"] = 1] = "Resolved";
    Status[Status["Pending"] = 2] = "Pending";
})(Status || (Status = {}));

var CGPromise = /** @class */ (function () {
    function CGPromise(cb) {
        var _this = this;
        this.status = Status.Pending;
        this.payload = null;
        this.thenCallbacks = [];
        this.errCallbacks = [];
        setTimeout(function () {
            cb(function (val) { return _this.resolve(val); }, function (err) { return _this.reject(err); });
        });
    }
    CGPromise.prototype.then = function (cb) {
        var _this = this;
        // resolve with the value immediately
        // or add it to a list of callbacks which will get called later
        if (this.status === Status.Resolved) {
            return new CGPromise(function (resolve, reject) {
                var thenCb = _this.getAction(resolve, reject, cb);
                thenCb(_this.payload);
            });
        }
        else if (this.status === Status.Rejected) {
            return new CGPromise(function (resolve, reject) {
                reject(_this.payload);
            });
        }
        else {
            return new CGPromise(function (resolve, reject) {
                var thenCb = _this.getAction(resolve, reject, cb);
                _this.thenCallbacks.push(thenCb);
                _this.errCallbacks.push(function () {
                    reject(_this.payload);
                });
            });
        }
    };
    CGPromise.prototype.catch = function (cb) {
        var _this = this;
        // resolve with the value immediately
        // or add it to a list of callbacks which will get called later
        if (this.status === Status.Rejected) {
            return new CGPromise(function (resolve, reject) {
                var errCb = _this.getAction(resolve, reject, cb);
                errCb(_this.payload);
            });
        }
        else if (this.status === Status.Resolved) {
            return new CGPromise(function (resolve) {
                resolve(_this.payload);
            });
        }
        else {
            return new CGPromise(function (resolve, reject) {
                var errCb = _this.getAction(resolve, reject, cb);
                _this.errCallbacks.push(errCb);
                _this.thenCallbacks.push(function () {
                    resolve(_this.payload);
                });
            });
        }
    };
    CGPromise.prototype.reject = function (err) {
        var _this = this;
        if (this.status !== Status.Pending) {
            return;
        }
        this.status = Status.Rejected;
        this.payload = err;
        this.errCallbacks.forEach(function (cb) {
            cb(_this.payload);
        });
    };
    CGPromise.prototype.resolve = function (val) {
        var _this = this;
        if (this.status !== Status.Pending) {
            return;
        }
        this.status = Status.Resolved;
        this.payload = val;
        this.thenCallbacks.forEach(function (cb) {
            cb(_this.payload);
        });
    };
    CGPromise.prototype.getAction = function (resolve, reject, cb) {
        return function (newPayload) {
            try {
                var result = cb(newPayload);
                if (result instanceof CGPromise) {
                    result.then(resolve);
                    result.catch(reject);
                }
                else {
                    resolve(result);
                }
            }
            catch (err) {
                reject(err);
            }
        };
    };
    return CGPromise;
}());
CGPromise.resolve = function (value) {
    return new CGPromise(function (resolve) {
        resolve(value);
    });
};
CGPromise.reject = function (error) {
    return new CGPromise(function (resolve, reject) {
        reject(error);
    });
};
CGPromise.all = function (promises) {
    promises = promises || [];
    return new CGPromise(function (resolve, reject) {
        // Waiting until all results to complete
        var results = new Array(promises.length);
        var numComplete = 0;
        promises.forEach(function (promise, index) {
            promise.then(function (val) {
                results[index] = val;
                numComplete += 1;
                if (numComplete === promises.length) {
                    resolve(results);
                }
            });
        });
        // If any of them error out, reject the promise.
        promises.forEach(function (promise) {
            promise.catch(function (err) {
                reject(err);
            });
        });
    });
};

return CGPromise;

})));
//# sourceMappingURL=cg-promise.js.map
