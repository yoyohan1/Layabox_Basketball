function argumentsToArray(args) {
  var result = [];
  for (var i = 0; i < args.length; i++)
    result.push(args[i]);
  return result;
}

var EventContainer = function () {};
// 绑定事件
EventContainer.prototype.attachEvent = function (oListener, sEvent, fpNotify, tDelay) {
  if (typeof fpNotify != "function") {
    console.error("AttachEvent fpNotify is not function");
  }
  if (!this[sEvent])
    this[sEvent] = [];
  if (!(this[sEvent] instanceof Array))
    return false;
  for (var i = 0; i < this[sEvent].length; i++)
    if (this[sEvent][i].o == oListener && this[sEvent][i].f == fpNotify)
      return true;
  this[sEvent].push({
    o: oListener,
    f: fpNotify,
    t: tDelay
  });
  return true;
};
// 解除事件绑定
EventContainer.prototype.detachEvent = function (oListener, sEvent, fpNotify) {
  if (!this[sEvent] || !(this[sEvent] instanceof Array))
    return false;
  for (var i = 0; i < this[sEvent].length; i++) {
    if (this[sEvent][i].o == oListener && this[sEvent][i].f == fpNotify) {
      this[sEvent].splice(i, 1);
      if (0 == this[sEvent].length)
        delete this[sEvent];
      return true;
    }
  }
  return false;
};
// 激发事件
EventContainer.prototype.fireEvent = function (sEvent) {
  if (!this[sEvent] || !(this[sEvent] instanceof Array))
    return false;
  var args = argumentsToArray(arguments);
  var listener = this[sEvent].slice(0);
  var ret = false;
  for (var i = 0; i < listener.length; i++) {
    if (typeof (listener[i].t) == "number")
      listener[i].f.delayApply(listener[i].t, listener[i].o, args);
    else
      ret |= listener[i].f.apply(listener[i].o, args); //有一个返回true,就返回true
    if (ret) {
      break;
    }
  }
  return ret;
};

function generalWebPeerId(productId) {
  var d = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  var peerid = 'xxxxxxxxxxxxxxx'.replace(/[x]/g, function (c) {
    var r = (d + Math.random() * 36) % 36 | 0;
    d = Math.floor(d / 36);
    rc = (c === 'x' ? r : (r & 0x3 | 0x8)).toString(36);
    return (Math.random() > 0.5) ? rc : rc.toUpperCase();
  });
  return peerid + productId;
}

function getWebPeerId(productId, callback) {
  chrome.storage.local.get("__XLWebPeerId__", function (items) {
    console.log('getWebPeerId items: ', items);
    if (items && items.__XLWebPeerId__) {
      callback(items.__XLWebPeerId__);
    } else {
      var webPeerId = generalWebPeerId(productId);
      console.log('generalWebPeerId: ', webPeerId);
      chrome.storage.local.set({
        __XLWebPeerId__: webPeerId
      });
      callback(webPeerId);
    }
  });
}

// Ajax http请求封装
function Ajax(params) {
  params = params || {};
  params.data = params.data || {};
  // 判断是ajax请求还是jsonp请求
  var json = params.jsonp ? jsonp(params) : json(params);
  // ajax请求 
  function json(params) {
    // 请求方式，默认是GET
    params.type = (params.type || 'GET').toUpperCase();
    // 避免有特殊字符，必须格式化传输数据
    params.data = formatParams(params.data);

    var xhr = new XMLHttpRequest();

    // 监听事件，只要 readyState 的值变化，就会调用 readystatechange 事件
    xhr.onreadystatechange = function () {
      // readyState属性表示请求/响应过程的当前活动阶段，4为完成，已经接收到全部响应数据
      if (xhr.readyState == 4) {
        var status = xhr.status;
        // status：响应的HTTP状态码，以2开头的都是成功
        if (status >= 200 && status < 300) {
          var response = '';
          // 判断接受数据的内容类型
          var type = xhr.getResponseHeader('Content-type');
          if (type.indexOf('xml') !== -1 && xhr.responseXML) {
            response = xhr.responseXML; //Document对象响应 
          } else if (type === 'application/json') {
            response = JSON.parse(xhr.responseText); //JSON响应 
          } else {
            response = xhr.responseText; //字符串响应 
          };
          // 成功回调函数
          params.success && params.success(response);
        } else {
          params.error && params.error(status);
        }
      };
    };

    // 连接和传输数据 
    if (params.type == 'GET') {
      // 三个参数：请求方式、请求地址(get方式时，传输数据是加在地址后的)、是否异步请求(同步请求的情况极少)；
      if (params.data.length > 0) {
        xhr.open(params.type, params.url + '?' + params.data, true);
      } else {
        xhr.open(params.type, params.url, true);
      }
      xhr.send(null);
    } else {
      xhr.open(params.type, params.url, true);
      //必须，设置提交时的内容类型 
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      // 传输数据
      xhr.send(params.data);
    }
  }

  //格式化参数 
  function formatParams(data) {
    var arr = [];
    for (var name in data) {
      // encodeURIComponent() ：用于对 URI 中的某一部分进行编码
      arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    };
    return arr.join('&');
  }
}