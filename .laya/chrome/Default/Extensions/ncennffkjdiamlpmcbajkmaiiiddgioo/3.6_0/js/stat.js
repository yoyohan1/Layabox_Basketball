var extensionVersion = undefined;

var __httpstat = function (aid, id, ext, thunderVersion, peerId, osVersion) {
  var url = `http://stat.download.xunlei.com:8099/?xlbtid=1&aid=${aid}&id=${id}&peerid=${peerId}&userid=&referfrom=100001&OS=win&OSversion=${osVersion}&productname=ThunderX&productversion=${thunderVersion}&pluginVersion=${extensionVersion}`;
  if (ext && ext.length > 0) {
    url += "&" + ext;
  }
  Ajax({
    url: url,
    type: 'GET',
    success: function (res) { // 请求成功的回调函数
      console.log("stat success!");
    },
    error: function (error) {
      console.log("stat failed! error:", error);
    }
  });
}

var __stat = function (aid, id, ext) {
  XLNativeMessage.connect();
  XLNativeMessage.postMessage("GetThunderInfo", [], undefined, function (ret, result, parameters) {
    if (ret) {
      var peerId = result[0].peerId;
      var osVersion = result[0].osVersion;
      var thunderVersion = result[0].thunderVersion;
      __httpstat(aid, id, ext, thunderVersion, peerId, osVersion);
    } else {
      getWebPeerId("Q", function (webPeerId) {
        __httpstat(aid, id, ext, "", webPeerId, "");
      })
    }
  });
}

function stat(aid, id, ext) {
  if (!extensionVersion) {
    Ajax({
      url: chrome.extension.getURL('manifest.json'),
      type: 'GET',
      success: function (manifest) { // 请求成功的回调函数
        extensionVersion = manifest.version;
        __stat(aid, id, ext);
      },
      error: function (error) {
        console.log("stat failed! error:", error);
      }
    });
  } else {
    __stat(aid, id, ext);
  }
}