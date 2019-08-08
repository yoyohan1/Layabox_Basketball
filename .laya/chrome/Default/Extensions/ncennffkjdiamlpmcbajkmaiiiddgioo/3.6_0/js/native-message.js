NativeMessage.prototype = {
  onNativeMessage: function (message) {
    console.log('onNativeMessage message:', message);
    var callbackId = message.callbackId;
    if (callbackId) {
      var callbackNode = this.callbackMap[callbackId];
      if (callbackNode) {
        callbackNode.f.apply(callbackNode.o, [true, message.result, message.paramters]);
        this.callbackMap[callbackId] = undefined;
      }
    }
  },

  onDisconnect: function () {
    console.log("onDisconnect selfQuit:", this.selfQuit);
    if (!this.selfQuit) {
      this.nativePort = null;
    }
    this.eventContainer.fireEvent("OnDisconnect", this.selfQuit);
  },

  // 以下是外部访问函数
  attachConnectEvent: function (listener, callback) {
    this.eventContainer.attachEvent(listener, "OnConnect", callback);
  },

  attachDisconnectEvent: function (listener, callback) {
    this.eventContainer.attachEvent(listener, "OnDisconnect", callback);
  },

  attachNativeMessage: function (listener, callback) {
    this.eventContainer.attachEvent(listener, "OnNativeMessage", callback);
  },

  // 
  postMessage: function (funcName, paramters, listener, callback) {
    if (this.nativePort != null) {
      var callbackId = undefined;
      if (callback) {
        callbackId = this.callbackIdIndex++;
      }
      var message = {
        "funcName": funcName,
        "paramters": paramters,
        "callbackId": callbackId
      };
      this.nativePort.postMessage(message);
      if (callback) {
        this.callbackMap[callbackId] = {
          o: listener,
          f: callback
        };
      }
      console.log("postMessage msg sucess! message:", message);
    } else {
      console.error("postMessage failed! funcName: ", funcName, ', parameters: ', paramters);
      if (callback) {
        callback.apply(listener, [false]);
      }
    }
  },

  sendQuit: function () {
    console.trace('sendQuit');
    if (this.nativePort) {
      this.selfQuit = true;
      this.postMessage("ChromeQuit", []);
      this.nativePort = null;
    }
  },

  // 连接
  connect: function () {
    var ret = false;
    do {
      if (this.nativePort) {
        console.log("native already connect!");
        ret = true;
        break;
      }
      var hostName = "com.xunlei.thunder";
      this.nativePort = chrome.runtime.connectNative(hostName);

      if (this.nativePort == null) {
        console.log("connect failed!");
        this.eventContainer.fireEvent("OnConnect", false);
        break;
      }
      console.log("connect sucessful!");
      var this_ = this;
      this.nativePort.onMessage.addListener(function (message) {
        this_.onNativeMessage(message);
      });
      this.nativePort.onDisconnect.addListener(function () {
        this_.onDisconnect();
      });
      this.eventContainer.fireEvent("OnConnect", true);
      ret = true;
    } while (false);
    return ret;
  }
}

function NativeMessage() {
  this.nativePort = null;
  this.eventContainer = new EventContainer();
  this.selfQuit = false;
  this.callbackMap = {};
  this.callbackIdIndex = 1;
}

var XLNativeMessage = new NativeMessage();