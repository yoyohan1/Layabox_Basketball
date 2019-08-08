/*
	thunder network
*/

Backgroud.prototype = {
  // 更新右键菜单
  updateContextMenu: function (bEnableMenu) {
    chrome.contextMenus.update("ThunderContextMenu", {
      enabled: bEnableMenu
    });
  },

  // 更新工具栏标记
  updataToolbarBadgeText: function (text, tabId) {
    var details = {
      text: text,
      tabId: tabId
    };
    chrome.browserAction.setBadgeText(details);
  },

  // 更新工具栏tips
  updataToolbarTips: function (text, tabId) {
    var details = {
      title: text,
      tabId: tabId
    };
    // console.log('browserAction.setTitle', details);
    chrome.browserAction.setTitle(details);
  },

  // 更新工具栏图标
  updateBrowserActionIcon: function (iconPath, tabId) {
    var details = {
      path: iconPath,
      tabId: tabId
    }
    // console.log('browserAction.setIcon', details);
    chrome.browserAction.setIcon(details);
  },

  setToolbarEnableStatus: function (tabId) {
    this.updateBrowserActionIcon("images/icon19_normal.png", tabId);
    this.updataToolbarTips("迅雷Chrome支持", tabId);
    this.updataToolbarBadgeText("", tabId);
  },

  setToolbarDisableStatus: function (tabId) {
    this.updateBrowserActionIcon("images/icon19_disabled.png", tabId);
    this.updataToolbarTips("迅雷Chrome支持已被禁用", tabId);
    this.updataToolbarBadgeText("", tabId);
  },

  setToolbarExceptionStatus: function () {
    this.updateBrowserActionIcon("images/icon19_normal.png");
    this.updataToolbarTips("迅雷Chrome支持出现异常");
    this.updataToolbarBadgeText("!");
  },

  setToolbarPageDisableStatus: function (tabId) {
    this.updateBrowserActionIcon("images/icon19_pageDisable.png", tabId);
    this.updataToolbarTips("当前页面已禁用迅雷Chrome支持", tabId);
    this.updataToolbarBadgeText("", tabId);
  },

  // invoke thunder
  invokeThunder: function (link, cookie, referurl, sourceNum) {
    var strSplitter = "#@$@#";
    var strUrls = referurl;
    strUrls = strUrls.concat(strSplitter);
    strUrls = strUrls.concat(1, strSplitter);

    strUrls = strUrls.concat(link, strSplitter);
    strUrls = strUrls.concat("", strSplitter);
    strUrls = strUrls.concat("", strSplitter);
    strUrls = strUrls.concat(cookie, strSplitter);
    strUrls = strUrls.concat("", strSplitter);
    strUrls = strUrls.concat("", strSplitter);

    XLNativeMessage.connect();
    // XLNativeMessage.postMessage("SendBhoLaunchSourceStat", [sourceNum, link]);
    stat(1022, 918);
    XLNativeMessage.postMessage("DownLoadByThunder", [strUrls]);
    XLNativeMessage.sendQuit();
  },

  enumTabSetEnabled: function (bEnabled) {
    var self = this;
    chrome.tabs.query({ active: true }, function queryResult(tabArray) {
      if (tabArray) {
        for (var i = 0; i < tabArray.length; i++) {
          var tab = tabArray[i];
          var bWebsiteEnabled = !self.checkIsWebsiteInUserBlackList(tab.url);
          var bPageEnabled = !self.checkIsPageInUserBlackList(tab.url);
          self.setToolbarStatus(self.exception, bEnabled, bWebsiteEnabled, bPageEnabled, tab.id);
        }
      }
    });
  },

  setPluginEnabled: function (bEnabled) {
    console.log('setPluginEnabled', bEnabled);
    XLNativeMessage.connect();
    chrome.tabs.getSelected(null,
      function (tab) {
        chrome.tabs.sendMessage(tab.id, {
          name: "UpdatePluginEnabled",
          enable: bEnabled
        });
      }
    );

    this.pluginEnabled = bEnabled;
    this.enumTabSetEnabled(bEnabled);
    this.updateContextMenu(bEnabled);
    XLNativeMessage.postMessage("SetPluginEnabled", [bEnabled]);
    XLNativeMessage.sendQuit();
  },

  setMoniterDynamicLinks: function (bMonitor) {
    XLNativeMessage.connect();
    chrome.tabs.getSelected(null,
      function (tab) {
        chrome.tabs.sendMessage(tab.id, {
          name: "UpdateMoniterDynamicLinks",
          enable: bMonitor
        });
      }
    );

    this.moniterDynamicLinks = bMonitor;
    XLNativeMessage.postMessage("SetMoniterDynamicLinks", [bMonitor])
    XLNativeMessage.sendQuit();
  },

  onAddBlackListPage: function (ret, result, paramters) {
    if (ret && result[0].retVal) {
      chrome.tabs.getSelected(null,
        function (tab) {
          chrome.tabs.sendMessage(tab.id, {
            name: "UpdatePageEnabled",
            enable: false
          });
        }
      );

      this.blackListPageArray[this.blackListPageArray.length] = paramters[0];
    }

    XLNativeMessage.sendQuit();
  },

  addBlackListPage: function (url, tabId) {
    XLNativeMessage.connect();
    for (var i in this.blackListPageArray) {
      if (this.blackListPageArray[i] == url) {
        // 去重
        return;
      }
    }
    XLNativeMessage.postMessage("AddBlackListPage", [url], this, this.onAddBlackListPage);
    this.setToolbarStatus(this.exception, this.pluginEnabled, true, false, tabId);
  },

  onRemoveBlackListPage: function (ret, result, paramters) {
    if (ret && result[0].retVal) {
      chrome.tabs.getSelected(null,
        function (tab) {
          chrome.tabs.sendMessage(tab.id, {
            name: "UpdatePageEnabled",
            enable: true
          });
        }
      );

      for (var i in this.blackListPageArray) {
        if (this.blackListPageArray[i] == paramters[0]) {
          console.log('onRemoveBlackListPage', paramters[0]);
          delete this.blackListPageArray[i];
        }
      }
    }
    XLNativeMessage.sendQuit();
  },

  removeBlackListPage: function (url, tabId) {
    XLNativeMessage.connect();
    for (var i in this.blackListPageArray) {
      if (this.blackListPageArray[i] == url) {
        XLNativeMessage.postMessage("RemoveBlackListPage", [url], this, this.onRemoveBlackListPage);
        this.setToolbarStatus(this.exception, this.pluginEnabled, true, true, tabId);
        break;
      }
    }
  },

  onAddBlackListWebsite: function (ret, result, paramters) {
    if (ret && result[0].retVal) {
      chrome.tabs.getSelected(null,
        function (tab) {
          chrome.tabs.sendMessage(tab.id, {
            name: "UpdateWebsiteEnabled",
            enable: false
          });
        }
      );

      this.blackListWebsiteArray[this.blackListWebsiteArray.length] = paramters[0];
    }
    XLNativeMessage.sendQuit();
  },

  addBlackListWebsite: function (url, tabId) {
    XLNativeMessage.connect();
    for (var i in this.blackListWebsiteArray) {
      if (this.blackListWebsiteArray[i] == url) {
        // 去重
        return;
      }
    }

    XLNativeMessage.postMessage("AddBlackListWebsite", [url], this, this.onAddBlackListWebsite);
    this.setToolbarStatus(this.exception, this.pluginEnabled, false, true, tabId);
  },

  onRemoveBlackListWebsite: function (ret, result, paramters) {
    if (ret && result[0].retVal) {
      chrome.tabs.getSelected(null,
        function (tab) {
          chrome.tabs.sendMessage(tab.id, {
            name: "UpdateWebsiteEnabled",
            enable: true
          });
        }
      );

      for (var i in this.blackListWebsiteArray) {
        if (this.blackListWebsiteArray[i] == paramters[0]) {
          delete this.blackListWebsiteArray[i];
        }
      }
    }
    XLNativeMessage.sendQuit();
  },

  removeBlackListWebsite: function (website, url, tabId, bPageEnabled) {
    console.log('removeBlackListWebsite in', website, url, tabId, bPageEnabled);
    XLNativeMessage.connect();
    for (var i in this.blackListWebsiteArray) {
      if (this.blackListWebsiteArray[i] == website) {
        XLNativeMessage.postMessage("RemoveBlackListWebsite", [website], this, this.onRemoveBlackListWebsite);
        if (bPageEnabled === undefined) {
          bPageEnabled = !this.checkIsPageInUserBlackList(url);
        }
        this.setToolbarStatus(this.exception, this.pluginEnabled, true, bPageEnabled, tabId);
        break;
      }
    }
  },

  checkIsWebsiteInUserBlackList: function (url) {
    var ret = false;
    do {
      for (var i in this.blackListWebsiteArray) {
        if (url.indexOf(this.blackListWebsiteArray[i]) == 0) {
          // 匹配
          ret = true;
          break;
        }
      }
    } while (0);
    return ret;
  },

  checkIsPageInUserBlackList: function (url) {
    var ret = false;
    do {
      for (var i in this.blackListPageArray) {
        if (url == this.blackListPageArray[i]) {
          // 匹配
          ret = true;
          break;
        }
      }
    } while (0)
    // console.log('checkIsPageInUserBlackList', this.blackListPageArray, url, ret);
    return ret;
  },

  canDownload: function (refUrl, url) {
    if (!this.pluginEnabled) {
      return false;
    }

    if (this.checkIsWebsiteInUserBlackList(refUrl)) {
      return false;
    }

    if (this.checkIsPageInUserBlackList(refUrl)) {
      return false;
    }

    if (!this.isMoniterUrl(url, refUrl)) {
      return false;
    }

    return true;
  },

  isValidUrlAndMonitorProtocol: function (url) {
    var strTraditionSchemeHeaders = "HTTP://HTTPS://FTP://THUNDER://MMS://MMST://RTSP://RTSPU://XLAPP://";
    var strEmuleSchemeHeader = "ED2K://";
    var strMagentSchemeHeader = "MAGNET:?";

    if (url.length === 0) {
      return false;
    }

    var strUrl = url;
    var nPos = strUrl.indexOf(':');
    if (nPos === -1) {
      return false;
    }

    var strScheme = strUrl.substr(0, nPos + 1);
    var scheme = strScheme.toUpperCase();
    if (scheme === "") {
      return false;
    }

    var bRet = true;
    if (strEmuleSchemeHeader.indexOf(scheme) !== -1) {
      if (this.monitorEmule == false) {
        bRet = false;
      }
    } else if (strMagentSchemeHeader.indexOf(scheme) !== -1) {
      if (this.monitorMagnet == false) {
        bRet = false;
      }
    } else if (strTraditionSchemeHeaders.indexOf(scheme) !== -1) {
      if (this.monitorTradition === false) {
        bRet = false;
      }
    } else {
      bRet = false;
    }
    return bRet;
  },

  isMonitorDemain: function (referer) {
    if (referer.length == 0) {
      return true;
    }

    //取得黑名单列表
    var arrDemain = new Array();
    var arrTemp = this.monitorDemains.split("||");
    for (var i in arrTemp) {
      var t = arrTemp[i].slice(2);
      var t2 = t.trimRight('|');
      arrDemain.push(t2);
    }

    //检查
    var bMonitor = true;
    var strUrl = referer;

    for (var j in arrDemain) {
      if (arrDemain[j].length > 0 && strUrl.indexOf(arrDemain[j]) != -1) {
        bMonitor = false;
        break;
      }
    }
    return bMonitor;
  },

  isFilterDemain: function (url) {
    if (url.length == 0) {
      return false;
    }

    if (this.filterDemains.length == 0) {
      return false;
    }

    var arrFilterDemain = new Array();
    var arrTemp = this.filterDemains.split("||");
    for (var i in arrTemp) {
      var t = (arrTemp[i].slice(2)).toLowerCase();
      var t2 = t.trimRight('|');
      arrFilterDemain.push(t2);
    }

    var bFilterDemain = false;
    var strUrl = url.toLowerCase();

    for (var j in arrFilterDemain) {
      if (arrFilterDemain[j] > 0 && strUrl.indexOf(arrFilterDemain[j]) != -1) {
        bFilterDemain = true;
        break;
      }
    }

    return bFilterDemain;
  },

  getExtensionFileName: function (pathfilename) {
    var reg = /(\\+)/g;
    var pfn = pathfilename.replace(reg, "#");
    var arrpfn = pfn.split("#");
    var fn = arrpfn[arrpfn.length - 1];
    var arrfn = fn.split(".");

    return arrfn[arrfn.length - 1];
  },

  isMonitorFileExt: function (url) {
    if (url.length == 0) {
      return false;
    }

    var nPos = url.indexOf(':');
    if (nPos == -1) {
      return false;
    }

    var strUrl = url.toLowerCase();
    var strScheme = strUrl.substr(0, nPos + 3);
    var scheme = strScheme.trimLeft(' ');

    if (scheme == ("xlapp://")) {
      //插件专用链   不检查后缀
      return true;
    }

    //电驴和磁力链接任务不需要比较后缀名
    if ((strUrl.indexOf("ed2k://") != -1) || (strUrl.indexOf("magnet:?") != -1)) {
      return true;
    }

    var bRet = false;
    var strExt = this.getExtensionFileName(strUrl);
    if (strExt.length > 0) {
      strExt += ";";
      if (this.monitorFileExts.indexOf(strExt) != -1) {
        bRet = true;
      }
    }
    return bRet;
  },

  isMoniterUrl: function (url, referer) {
    if (url.length === 0) {
      return false;
    }
    if (this.monitorIE === false) { //不监视浏览器
      return false;
    }
    if (this.isValidUrlAndMonitorProtocol(url) === false) { //非法URL
      return false;
    }
    if (this.isMonitorDemain(referer) === false) { //不监视域名(配置面板的)
      return false;
    }
    if (this.isFilterDemain(referer)) { //过滤的域名(服务器更新的)
      return false;
    }
    return true;
  },

  onIsDownloadURL: function (ret, result, paramters) {
    if (ret) {
      if (result[0].retVal) {
        this.invokeThunder(paramters[0], paramters[1], paramters[2], 1);
      } else {
        window.open(paramters[0]);
      }
      XLNativeMessage.sendQuit();
    }
  },

  registerEventListener: function () {
    // tab激活事件，通知xl.js更新页面相关信息
    chrome.tabs.onActivated.addListener(
      function (activeInfo) {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          name: "OnActivated",
          tabId: activeInfo.tabId
        });
      }
    );

    // xl.js接口请求
    var this_ = this;
    chrome.extension.onRequest.addListener(
      function (request, sender, response) {
        if (request.name == "xl_download") {
          this_.invokeThunder(request.link, request.cookie, request.referurl, 1);
        } else if (request.name === 'CheckActivated') {
          chrome.tabs.query({
            url: request.url
          }, function queryResult(tabArray) {
            console.log('CheckActivated', tabArray);
            if (tabArray) {
              for (var i = 0; i < tabArray.length; i++) {
                var tab = tabArray[i];
                if (tab.active) {
                  chrome.tabs.sendMessage(tab.id, {
                    name: "OnActivated",
                    tabId: tab.id
                  });
                }
              }
            }
          });
        } else if (request.name == "CheckEnabled") {
          var bPlugin = this_.pluginEnabled;
          var bWebsite = !this_.checkIsWebsiteInUserBlackList(request.url);
          var bPage = !this_.checkIsPageInUserBlackList(request.url);

          response({
            bPlugin: bPlugin,
            bWebsite: bWebsite,
            bPage: bPage
          });

          this_.setToolbarStatus(this_.exception, this_.pluginEnabled, bWebsite, bPage, request.tabId);
        } else if (request.name == "CheckbMoniterDynamicLinks") {
          response({
            bMoniterDynamicLinks: this_.moniterDynamicLinks
          });
        } else if (request.name == "CheckChromeDownloadAPIEnabled") {
          response({
            bEnabled: this_.bUseChromeDownloadAPI
          });
        } else if (request.name == "xl_check_url") {
          XLNativeMessage.postMessage("IsDownloadURL", [request.link, request.cookie, request.referurl], this_, this_.onIsDownloadURL);
        } else if (request.name == "GetConfig") {
          response({
            bMonitorEmule: this_.monitorEmule,
            bMonitorMagnet: this_.monitorMagnet,
            bMonitorTradition: this_.monitorTradition,
            bMonitorIE: this_.monitorIE,
            monitorDemains: this_.monitorDemains,
            filterDemains: this_.filterDemains,
            monitorFileExts: this_.monitorFileExts
          });
        } else if (request.name == "CtrlLinkItem") {
          this_.linkItem = request.link;
        }
      }
    );

    if (this.bUseChromeDownloadAPI) {
      // 拦截downloads
      chrome.downloads.onCreated.addListener(
        function callback(item) {
          do {
            if (item.state === "complete" || item.state === "interrupted") {
              // 此api的一个坑，首次安装会将下载列表已下载过的东西全部下一遍
              // console.debug("%s %s %s", item.state, " :", item.url);
              break;
            }

            console.log('downloads.onCreated item:', item);
            if (this_.linkItem === item.url) {
              // 按ctrl键，则不监视
              this_.linkItem = "";
              break;
            }

            // https://developer.chrome.com/extensions/downloads
            // url : The absolute URL that this download initiated from, before any redirects.
            // finalUrl ： Since Chrome 54. The absolute URL that this download is being made from, after all redirects.
            var link = item.url;
            if (item.finalUrl) {
              link = item.finalUrl;
            }

            if (!this_.canDownload(item.referrer, link)) {
              break;
            }

            // XLNativeMessage.connect();
            // XLNativeMessage.postMessage("SendBhoLaunchSourceStat", [2, item.url]);
            // XLNativeMessage.sendQuit();

            if (!this_.moniterDynamicLinks) {
              // console.log('downloads.onCreated moniterDynamicLinks:', this_.moniterDynamicLinks)
              break;
            }

            // 取消chrome默认下载
            chrome.downloads.cancel(item.id);

            // 删除下载记录，有时默认下载会先执行，因为异步，防止出现默认下载框
            chrome.downloads.erase({
              id: item.id
            },
              function (ids) {
                //
              }
            );

            // 图片在新标签中打开，在新标签页再点击图片另存为时，不应该关闭标签； 20190320
            if (item.url !== item.referrer) {
              // 关闭chrome新建下载留存的tab
              if (item.url === 'about:blank') {
                chrome.tabs.getSelected(null,
                  function (tab) {
                    if (tab && tab.url === '') {
                      chrome.tabs.remove(tab.id);
                    }
                  }
                );

                // chrome.tabs.query({ active: true },
                //   function queryResult(tabArray) {
                //     console.log('query result', item.url, tabArray)
                //     if (tabArray) {
                //       for (var i = 0; i < tabArray.length; i++) {
                //         if (tabArray[i].url === '') {
                //           chrome.tabs.remove(tabArray[i].id);
                //           break;
                //         }
                //       }
                //     }
                //   }
                // );
              } else {
                chrome.tabs.query({ url: item.url },
                  function queryResult(tabArray) {
                    console.log('query result', item.url, tabArray)
                    if (tabArray && tabArray[0]) {
                      chrome.tabs.remove(tabArray[0].id);
                    }
                  }
                );
              }
            }

            if (item.referrer === '') {
              // 引用页未查到，使用空cookie
              this_.invokeThunder(link, "", item.referrer, 1);
              break;
            }

            // 获取引用页的cookie
            chrome.tabs.query({
              url: item.referrer
            },
              function queryResult(tabArray) {
                if (tabArray && tabArray[0]) {
                  chrome.tabs.sendMessage(tabArray[0].id, {
                    name: "GetCookie"
                  },
                    function (resp) {
                      var realCookie = "";
                      if (resp && resp.cookie) {
                        realCookie = resp.cookie;
                      }
                      this_.invokeThunder(link, realCookie, item.referrer, 1);
                    }
                  );
                } else {
                  // 引用页未查到，使用空cookie
                  this_.invokeThunder(link, "", item.referrer, 1);
                }
              }
            );
          } while (0);
        }
      );
    }
  },

  setToolbarStatus: function (bPluginException, pluginEnabled, bWebsiteEnabled, bPageEnabled, tabId) {
    do {
      console.trace("setToolbarStatus bPluginException:", bPluginException, ", pluginEnabled:", pluginEnabled,
        ", bWebsiteEnabled:", bWebsiteEnabled, ", bPageEnabled:", bPageEnabled, ', tabId:', tabId);
      if (bPluginException) {
        this.setToolbarExceptionStatus();
        break;
      }

      if (!pluginEnabled) {
        this.setToolbarDisableStatus(tabId);
        break;
      }

      if (bWebsiteEnabled && bPageEnabled) {
        this.setToolbarEnableStatus(tabId);
        break;
      } else {
        this.setToolbarPageDisableStatus(tabId);
        break;
      }
    } while (false);
  },

  // menu click
  onStartupThunder: function (info, tab) {
    var self = this;
    chrome.cookies.getAll({
      url: info.pageUrl
    }, function (cookies) {
      var cookie = "";
      for (i in cookies) {
        cookie = cookie.concat(cookies[i].name, "=", cookies[i].value, "; ");
      };

      self.invokeThunder(info.linkUrl, cookie, info.pageUrl, 3);
    });
  },

  // 创建右键菜单
  createContextMenu: function (bEnableMenu) {
    var self = this;
    var thunderMenu = {
      id: "ThunderContextMenu",
      type: "normal",
      title: chrome.i18n.getMessage("context_title"),
      contexts: ["link"],
      onclick: function (info, tab) {
        self.onStartupThunder(info, tab);
      },
      enabled: bEnableMenu
    };
    chrome.contextMenus.create(thunderMenu, function () {
      console.log("createContextMenu callback, lastError: ", chrome.extension.lastError);
    });
  },

  onGetMoniterDynamicLinks: function (ret, result, paramters) {
    if (ret) {
      this.moniterDynamicLinks = result[0].retVal;
      stat(1022, 917, "value1=" + (this.moniterDynamicLinks ? "1" : "0"));
    }
  },

  onGetBlackListWebsites: function (ret, result, paramters) {
    console.log("onGetBlackListWebsites:", result);
    if (ret) {
      if (result[0].retVal) {
        this.blackListWebsiteArray = result[1].blackList;
      } else {
        this.blackListWebsiteArray = [];
      }
    }
  },

  onGetBlackListPages: function (ret, result, paramters) {
    if (ret) {
      if (result[0].retVal) {
        this.blackListPageArray = result[1].blackList;
      } else {
        this.blackListPageArray = [];
      }
    }
  },

  onGetIsMonitorProtocol: function (ret, result, paramters) {
    if (ret && result[0].retVal) {
      if (paramters[0] == "MonitorEmule") {
        this.monitorEmule = result[1].value;
      } else if (paramters[0] == "MonitorMagnet") {
        this.monitorMagnet = result[1].value;
      } else if (paramters[0] == "MonitorTradition") {
        this.monitorTradition = result[1].value;
      } else if (paramters[0] == "MonitorIE") {
        this.monitorIE = result[1].value;
      }
    }
  },

  onGetFiters: function (ret, result, paramters) {
    if (ret) {
      if (result[0].retVal) {
        if (paramters[0] == "MonitorDemain") {
          this.monitorDemains = result[1].value;
        } else if (paramters[0] == "FilterDemain") {
          this.filterDemains = result[1].value;
        } else if (paramters[0] == "MonitorFileExt") {
          this.monitorFileExts = result[1].value;
        }
      }
      XLNativeMessage.sendQuit();
    }
  },

  onGetPluginEnabled: function (ret, result, paramters) {
    do {
      if (!ret) {
        break;
      }
      console.log('onGetPluginEnabled result: ', result, ', paramters: ', paramters);
      this.pluginEnabled = result[0].retVal;

      this.updateContextMenu(this.pluginEnabled);

      this.pluginEnabled ? this.setToolbarEnableStatus() : this.setToolbarDisableStatus();

      XLNativeMessage.postMessage("GetMoniterDynamicLinks", [], this, this.onGetMoniterDynamicLinks);
      XLNativeMessage.postMessage("GetBlackListWebsites", [], this, this.onGetBlackListWebsites);
      XLNativeMessage.postMessage("GetBlackListPages", [], this, this.onGetBlackListPages);

      XLNativeMessage.postMessage("GetIsMonitorProtocol", ["MonitorEmule"], this, this.onGetIsMonitorProtocol);
      XLNativeMessage.postMessage("GetIsMonitorProtocol", ["MonitorMagnet"], this, this.onGetIsMonitorProtocol);
      XLNativeMessage.postMessage("GetIsMonitorProtocol", ["MonitorTradition"], this, this.onGetIsMonitorProtocol);
      XLNativeMessage.postMessage("GetIsMonitorProtocol", ["MonitorIE"], this, this.onGetIsMonitorProtocol);

      XLNativeMessage.postMessage("GetFiters", ["MonitorDemain"], this, this.onGetFiters);
      XLNativeMessage.postMessage("GetFiters", ["FilterDemain"], this, this.onGetFiters);
      XLNativeMessage.postMessage("GetFiters", ["MonitorFileExt"], this, this.onGetFiters);

      stat(1022, 916, "value1=" + (this.pluginEnabled ? "1" : "0"));
    } while (false);
  },
  feedback: function () {
    XLNativeMessage.connect();
    XLNativeMessage.postMessage("GetThunderInfo", [], undefined, function (ret, result, parameters) {
      var peerId = "";
      var thunderVersion = "";
      if (ret) {
        peerId = result[0].peerId;
        thunderVersion = result[0].thunderVersion;
      }
      var url = `http://misc-xl9-ssl.xunlei.com/client/view/dist/1.0/feedback.html?version=${thunderVersion}&pid=${peerId}`;
      chrome.tabs.create({
        url: url
      },
        function () { }
      );
    });
    XLNativeMessage.sendQuit();
  },

  onDisconnect: function (selfQuit) {
    if (!selfQuit) {
      this.pluginEnabled = false;
      this.exception = true;
      this.setToolbarExceptionStatus();

      chrome.tabs.getAllInWindow(null,
        function (tabs) {
          for (var i in tabs) {
            chrome.tabs.sendMessage(tabs[i].id, {
              name: "UpdatePluginEnabled",
              enable: this.pluginEnabled
            });
          }
        }
      );
    }
  },
  init: function () {
    // 尝试连接 native-message
    XLNativeMessage.attachDisconnectEvent(this, this.onDisconnect);
    var connect = XLNativeMessage.connect();
    if (connect) {
      // 获取是否开启插件
      XLNativeMessage.postMessage("GetPluginEnabled", [], this, this.onGetPluginEnabled);
    } else {
      this.pluginEnabled = false;
      this.exception = true;
      this.setToolbarExceptionStatus();
      stat(1022, 919);
    }

    // 创建右键扩展菜单
    this.createContextMenu(false);

    // 注册浏览器事件，xl.js交互，监听downloads api的处理
    this.registerEventListener();

    // 启动统计
    stat(1022, 920);
  }
};

function Backgroud() {
  this.pluginEnabled = true;
  this.exception = false;
  this.moniterDynamicLinks = false;
  this.blackListWebsiteArray;
  this.blackListPageArray;

  this.monitorEmule = false;
  this.monitorMagnet = false;
  this.monitorTradition = false;
  this.monitorIE = false;

  this.monitorDemains;
  this.filterDemains;
  this.monitorFileExts;

  this.bUseChromeDownloadAPI = chrome.downloads ? true : false;

  this.linkItem = ""; // 记录page传过来的ctrl+link的项
}

var XLBackgroud = new Backgroud();
XLBackgroud.init();


//======================================
// 以下为全局函数，提供给popup.js调用
//======================================
function onFeedback() {
  XLBackgroud.feedback();
}

function setPluginEnabled(pluginEnabled) {
  XLBackgroud.setPluginEnabled(pluginEnabled);
}

function setMoniterDynamicLinks(moniterDynamicLinks) {
  XLBackgroud.setMoniterDynamicLinks(moniterDynamicLinks);
}

function removeBlackListPage(url, tabId) {
  XLBackgroud.removeBlackListPage(url, tabId);
}

function removeBlackListWebsite(website, url, tabId, bPageEnabled) {
  XLBackgroud.removeBlackListWebsite(website, url, tabId, bPageEnabled);
}

function addBlackListPage(url, tabId) {
  XLBackgroud.addBlackListPage(url, tabId);
}

function addBlackListWebsite(url, tabId) {
  XLBackgroud.addBlackListWebsite(url, tabId);
}

function isException() {
  return XLBackgroud.exception;
}

function isPluginEnabled() {
  return XLBackgroud.pluginEnabled;
}

function isUseChromeDownloadAPI() {
  return XLBackgroud.bUseChromeDownloadAPI;
}

function isMoniterDynamicLinks() {
  return XLBackgroud.moniterDynamicLinks;
}

function checkIsWebsiteInUserBlackList(url) {
  return XLBackgroud.checkIsWebsiteInUserBlackList(url);
}

function checkIsPageInUserBlackList(url) {
  return XLBackgroud.checkIsPageInUserBlackList(url);
}
