/*
	thunder network
*/

var bLoaded;

var bPluginEnabled;
var bMoniterDynamicLinks;
var bWebsiteEnabled;
var bPageEnabled;

var bUseChromeDownloadAPI = true;

var bMonitorEmule = false;
var bMonitorMagnet = false;
var bMonitorTradition = false;
var bMonitorIE = false;

var strMonitorDemain;
var strFilterDemain;
var strMonitorFileExt;

var whiteRegexpArray = [".+sina.com.*\\/d_load.php\\?.+",
  ".+pcpop.com.*\\/redose.aspx\\?.+",
  ".+pcpop.com.*\\/download.php\\?.+",
  ".+pconline.com.cn\\/filedown.jsp\\?.+",
  ".+chinaz.com\\/download.asp\\?.+",
  ".+cnzz.cn\\/download.aspx\\?.+",
  ".+zol.com.*\\/down.php\\?.+",
  ".+zol.com.*\\?.*url=([^\\&]+).*",
  ".+crsky.com.*\\?down_url=([^\\&]+).*",
  ".+skycn.com.*\\/down.php\\?uri=(.+)",
  ".+downxia.com.*\\/download.asp\\?.*url=(.+)"
];

var blackRegexpArray = ["http.+\\?.*url=.+",
  "http.+\\?.*uri=.+"
];

function checkWhiteDynamicLink(linkUrl) {
  for (var i in whiteRegexpArray) {
    var regexp = new RegExp(whiteRegexpArray[i], "i");
    var result = regexp.exec(linkUrl);

    if (result == linkUrl) {
      return result;
    }

    if (result != null && result.length == 2) {
      return result[1];
    }
  }

  return null;
}

function checkBlackDynamicLink(linkUrl) {
  for (var i in blackRegexpArray) {
    var regexp = new RegExp(blackRegexpArray[i], "i");
    var result = regexp.exec(linkUrl);

    if (result != null) {
      return result;
    }
  }

  return null;
}

function IsDynamicLink(url) {

  var lowerLink = url.toLowerCase();

  var ret = true;

  if (lowerLink.indexOf("?") == -1 || lowerLink.indexOf("magnet:?") != -1) {
    ret = false;
  }

  return ret;
}

function IsValidUrlAndMonitorProtocol(url) {
  var s_strTraditionSchemeHeaders = "HTTP://FTP://THUNDER://MMS://MMST://RTSP://RTSPU://XLAPP://";
  var s_strEmuleSchemeHeader = "ED2K://";
  var s_strMagentSchemeHeader = "MAGNET:?";

  if (url.length == 0) {
    return false;
  }

  var strUrl = url;
  var nPos = strUrl.indexOf(':');
  if (nPos == -1) {
    return false;
  }

  var strScheme = strUrl.substr(0, nPos + 1);
  var scheme = strScheme.toUpperCase();
  if (scheme == "") {
    return false;
  }

  var bRet = true;

  if (s_strEmuleSchemeHeader.indexOf(scheme) != -1) {
    if (bMonitorEmule == false) {
      bRet = false;
    }

  } else if (s_strMagentSchemeHeader.indexOf(scheme) != -1) {
    if (bMonitorMagnet == false) {
      bRet = false;
    }

  } else if (s_strTraditionSchemeHeaders.indexOf(scheme) != -1) {
    if (bMonitorTradition == false) {
      bRet = false;
    }

  } else {
    bRet = false;
  }

  return bRet;
}

function IsMonitorDemain(referer) {
  if (referer.length == 0) {
    return true;
  }

  //取得黑名单列表
  var arrDemain = new Array();
  var arrTemp = strMonitorDemain.split("||");
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
}


function IsFilterDemain(url) {
  if (url.length == 0) {
    return false;
  }

  if (strFilterDemain.length == 0) {
    return false;
  }

  var arrFilterDemain = new Array();
  var arrTemp = strFilterDemain.split("||");
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
}

function GetExtensionFileName(pathfilename) {
  var reg = /(\\+)/g;
  var pfn = pathfilename.replace(reg, "#");
  var arrpfn = pfn.split("#");
  var fn = arrpfn[arrpfn.length - 1];
  var arrfn = fn.split(".");

  return arrfn[arrfn.length - 1];
}

function IsMonitorFileExt(url) {
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
  var strExt = GetExtensionFileName(strUrl);
  if (strExt.length > 0) {
    strExt += ";";
    if (strMonitorFileExt.indexOf(strExt) != -1) {
      bRet = true;
    }
  }


  return bRet;
}


function IsURLInMonitor(url, referer) {
  if (url.length == 0) {
    return false;
  }

  if (bMonitorIE == false) //不监视浏览器
  {
    return false;
  }

  if (IsValidUrlAndMonitorProtocol(url) == false) //非法URL
  {
    return false;
  }

  if (IsMonitorDemain(referer) == false) //不监视域名(配置面板的)
  {
    return false;
  }

  if (IsFilterDemain(referer)) //过滤的域名(服务器更新的)
  {
    return false;
  }

  if (IsMonitorFileExt(url) == false) //不监视后缀
  {
    return false;
  }

  return true;
}

function IsDownloadURL(url, cookie, referer) {
  var bIsDynamicLink = IsDynamicLink(url);

  if (!bIsDynamicLink) {
    return IsURLInMonitor(url, referer);
  }

  return false;
}


function checkDownloadLink(linkUrl) {
  //chrome.extension.IsDownloadURL(linkUrl, document.cookie, document.location.href);
  //chrome.extension.sendRequest({ name: "xl_check_url", link: linkUrl, cookie: document.cookie, referurl: document.location.href });
  return IsDownloadURL(linkUrl, document.cookie, document.location.href);



  // 必须总是先阻止打开网址
  //return false;
}

function GetConfig() {

  chrome.extension.sendRequest({
      name: 'GetConfig'
    },
    function (response) {
      bMonitorEmule = response.bMonitorEmule;
      bMonitorMagnet = response.bMonitorMagnet;
      bMonitorTradition = response.bMonitorTradition;
      bMonitorIE = response.bMonitorIE;

      strMonitorDemain = response.strMonitorDemain;
      strFilterDemain = response.strFilterDemain;
      strMonitorFileExt = response.strMonitorFileExt;
    }
  );


}


function CheckEnabled(url) {
  chrome.extension.sendRequest({
      name: 'CheckEnabled',
      url: url
    },
    function (response) {
      bPluginEnabled = response.bPlugin;
      bWebsiteEnabled = response.bWebsite;
      bPageEnabled = response.bPage;
    }
  );
}

function CheckbMoniterDynamicLinks(url) {
  chrome.extension.sendRequest({
      name: 'CheckbMoniterDynamicLinks'
    },
    function (response) {
      bMoniterDynamicLinks = response.bMoniterDynamicLinks;
    }
  );
}

function CheckChromeDownloadAPIEnabled() {
  chrome.extension.sendRequest({
      name: 'CheckChromeDownloadAPIEnabled'
    },
    function (response) {
      bUseChromeDownloadAPI = response.bEnabled;
    }
  );
}

// link click event
function onLinkClick(event) {

  if (bMoniterDynamicLinks) {
    // 使用download api去下载
    return;
  }
  if (bPluginEnabled && bWebsiteEnabled && bPageEnabled) {
    console.log("onLinkClick!");
    var linkUrl = this.href;

    var checkResult = checkWhiteDynamicLink(linkUrl);
    if (checkResult != null) {
      chrome.extension.sendRequest({
        name: "xl_download",
        link: checkResult,
        cookie: document.cookie,
        referurl: document.location.href
      });
      return event.preventDefault();
    }

    checkResult = checkBlackDynamicLink(linkUrl);
    if (checkResult != null) {
      return;
    }
    checkResult = checkDownloadLink(linkUrl);
    if (checkResult) {
      console.log("checkResult == false!");
      chrome.extension.sendRequest({
        name: "xl_download",
        link: linkUrl,
        cookie: document.cookie,
        referurl: document.location.href
      });
      return event.preventDefault();
    }
  }
}

function RegisterClickEventListener() {
  for (var i = 0; i < document.links.length; i++) {
    var link = document.links[i];
    link.addEventListener("click", onLinkClick, false);
  }
}

function RegisterExtensionMsgListener() {
  chrome.extension.onMessage.addListener(
    function (message, sender, sendResponseCallback) {
      if (message.name == "UpdatePluginEnabled") {
        bPluginEnabled = message.enable;
        //alert(bPluginEnabled);
      } else if (message.name == "UpdateMoniterDynamicLinks") {
        bMoniterDynamicLinks = message.enable;
      } else if (message.name == "UpdateWebsiteEnabled") {
        bWebsiteEnabled = message.enable;
      } else if (message.name == "UpdatePageEnabled") {
        bPageEnabled = message.enable;
      } else if (message.name == "OnActivated") {
        if (bLoaded) {
          // 切换回当前页，重新查询enable状态
          CheckEnabled(document.location.href);
          CheckbMoniterDynamicLinks();
        }
      } else if (message.name == "GetCookie") {
        sendResponseCallback({
          cookie: document.cookie
        });
      }
    }
  );
}

function Init() {
  bLoaded = true;

  RegisterExtensionMsgListener();
  CheckEnabled(document.location.href);
  CheckChromeDownloadAPIEnabled();
  CheckbMoniterDynamicLinks();
  RegisterClickEventListener();

  GetConfig();
}

Init();