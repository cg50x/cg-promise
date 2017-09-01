enum Status {
  Rejected,
  Resolved,
  Pending
};

export default class CGPromise {
  private status = Status.Pending;
  private payload = null;
  private thenCallbacks = [];
  private errCallbacks = [];

  public static resolve: any;
  public static reject: any;
  public static all: any;

  constructor(cb) {
    setTimeout(() => {
      cb(val => this.resolve(val), err => this.reject(err));
    });
  }
  
  then(cb) {
    // resolve with the value immediately
    // or add it to a list of callbacks which will get called later
    if (this.status === Status.Resolved) {
      return new CGPromise((resolve, reject) => {
        const thenCb = this.getAction(resolve, reject, cb);
        thenCb(this.payload);
      });
    } else if (this.status === Status.Rejected) {
      return new CGPromise((resolve, reject) => {
        reject(this.payload);
      });
    } else {
      return new CGPromise((resolve, reject) => {
        const thenCb = this.getAction(resolve, reject, cb);
        this.thenCallbacks.push(thenCb);
        this.errCallbacks.push(() => {
          reject(this.payload);
        });
      });
    }
  }

  catch(cb) {
    // resolve with the value immediately
    // or add it to a list of callbacks which will get called later
    if (this.status === Status.Rejected) {
      return new CGPromise((resolve, reject) => {
        const errCb = this.getAction(resolve, reject, cb);
        errCb(this.payload);
      });
    } else if (this.status === Status.Resolved) {
      return new CGPromise((resolve) => {
        resolve(this.payload);
      });
    } else {
      return new CGPromise((resolve, reject) => {
        const errCb = this.getAction(resolve, reject, cb);
        this.errCallbacks.push(errCb);
        this.thenCallbacks.push(() => {
          resolve(this.payload);
        });
      });
    }
  }

  private reject(err) {
    if (this.status !== Status.Pending) {
      return;
    }
    this.status = Status.Rejected;
    this.payload = err;
    this.errCallbacks.forEach((cb) => {
      cb(this.payload);
    });
  }

  private resolve(val) {
    if (this.status !== Status.Pending) {
      return;
    }
    this.status = Status.Resolved;
    this.payload = val;
    this.thenCallbacks.forEach((cb) => {
      cb(this.payload);
    });
  }
  
  private getAction(resolve, reject, cb) {
    return (newPayload) => {
      try {
        const result = cb(newPayload);
        if (result instanceof CGPromise) {
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
