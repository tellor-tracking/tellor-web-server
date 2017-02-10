this.window = this.window || {};
this.window.Tellor = (function () {
'use strict';

var isEventValid = function isEventValid(event) {
    return event.name !== undefined;
};
var formatEventAsParams = function formatEventAsParams(event) {
    return "events=[" + JSON.stringify(event) + "]";
};

var event = function event(_event) {
    if (isEventValid(_event)) {
        var params = void 0;
        try {
            params = formatEventAsParams(_event);
        } catch (e) {
            return;
        }

        return params;
    }
};

var formatters = {
   event: event
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var Transport = function () {
    function Transport(tellor, debug) {
        classCallCheck(this, Transport);

        this.tellor = tellor;
        this.runInterval = debug ? 500 : 10000;
        this.apiEndPoint = '/track';
        this.standardParams = this._formatStandardParams();
        setInterval(this.run.bind(this), this.runInterval);
    }

    createClass(Transport, [{
        key: 'run',
        value: function run() {
            var trackItems = this.tellor.store.get();
            trackItems.forEach(this._XHRGet.bind(this));
        }
    }, {
        key: '_XHRGet',
        value: function _XHRGet(trackItem) {
            var store = this.tellor.store;
            store.lockItem(trackItem);

            try {
                var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

                xhr.open('GET', '' + this.tellor.url + this.apiEndPoint + '?' + this.standardParams + '&' + trackItem.params, true);

                xhr.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                        store.remove(trackItem);
                    } else if (this.readyState === 4) {
                        store.unlockItem(trackItem);
                        console.error('Failed to track', trackItem);
                    }
                };

                xhr.send();
            } catch (e) {
                store.remove(trackItem);
            }
        }
    }, {
        key: '_formatStandardParams',
        value: function _formatStandardParams() {
            var t = this.tellor;
            var s = 'sdk=' + t.sdk + '&app_key=' + t.appKey + '&app_version=' + t.appVersion;
            if (t.user && t.user.id) s += 'userId=' + t.user.id;
            if (t.user && t.user.id && t.user.name) s += 'userId=' + t.user.name;

            return s;
        }
    }]);
    return Transport;
}();

var Store = function () {
    function Store(transport) {
        classCallCheck(this, Store);

        this.transport = transport;
        this._LSId = '__ttc__';
        this.q = this._getLocalStorageCache();
    }

    createClass(Store, [{
        key: 'submit',
        value: function submit(params) {
            var item = this._create(params);
            this._addToLocalStorage(item);
            this.q.push(item);
            this.transport.run();
        }
    }, {
        key: 'get',
        value: function get() {
            return this.q.filter(function (item) {
                return !item.isLocked;
            });
        }
    }, {
        key: 'remove',
        value: function remove(item) {
            var i = this.q.indexOf(item);
            if (i > -1) this.q.splice(i, 1);
            this._removeFromLocalStorage(item);
        }
    }, {
        key: 'lockItem',
        value: function lockItem(item) {
            item.isLocked = true;
        }
    }, {
        key: 'unlockItem',
        value: function unlockItem(item) {
            item.isLocked = false;
        }
    }, {
        key: '_create',
        value: function _create(params) {
            return {
                params: params,
                id: Date.now() + Math.random().toFixed()
            };
        }
    }, {
        key: '_getLocalStorageCache',
        value: function _getLocalStorageCache() {
            try {
                return JSON.parse(localStorage.getItem(this._LSId)) || [];
            } catch (e) {
                return [];
            }
        }
    }, {
        key: '_addToLocalStorage',
        value: function _addToLocalStorage(item) {
            var cache = this._getLocalStorageCache();
            cache.push(item);

            localStorage.setItem(this._LSId, JSON.stringify(cache));
        }
    }, {
        key: '_removeFromLocalStorage',
        value: function _removeFromLocalStorage(item) {
            var cache = this._getLocalStorageCache();

            var newCache = cache.filter(function (i) {
                return i.id != item.id;
            });
            localStorage.setItem(this._LSId, JSON.stringify(newCache));
        }
    }]);
    return Store;
}();

var Tellor = function () {
    function Tellor(formatters$$1, Transport$$1, Store$$1, _ref) {
        var appKey = _ref.appKey,
            _ref$appVersion = _ref.appVersion,
            appVersion = _ref$appVersion === undefined ? '1' : _ref$appVersion,
            url = _ref.url,
            user = _ref.user,
            _ref$debug = _ref.debug,
            debug = _ref$debug === undefined ? false : _ref$debug;
        classCallCheck(this, Tellor);

        this.sdk = 'web';
        this.appKey = appKey;
        this.appVersion = appVersion;
        this.url = url;
        this.user = user;

        this.formatters = formatters$$1;

        this.transport = new Transport$$1(this, debug);
        this.store = new Store$$1(this.transport, debug);

        if (window.__ttq !== undefined) {
            window.__ttq.forEach(this.track.bind(this)); // if any events in cache that was created before Tellor initialized, track them
        }
    }

    createClass(Tellor, [{
        key: 'track',
        value: function track(event) {
            var ef = this.formatters.event(event);

            if (ef) this.store.submit(ef);
        }
    }]);
    return Tellor;
}();

var index = {
    init: function init() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (!config.appKey || !config.url) {
            return console.warn('You must provide app_key and url');
        }

        window.Tellor = new Tellor(formatters, Transport, Store, config);
    }
};

return index;

}());
