// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var extension;
var bPluginEnabled;
var bMoniterDynamicLinks;
var bIsInWebsiteBlackList;
var bIsInPageBlackList;

function OnClickThunderChromeSupport(e) {
  extension.setPluginEnabled(!bPluginEnabled);
  window.close();
}

function OnClickMoniterDynamicLinks(e) {
  if (bPluginEnabled) {
    extension.setMoniterDynamicLinks(!bMoniterDynamicLinks);
    window.close();
  }
}

function OnClickThisPageDisableThunder(e) {
  if (bPluginEnabled) {
    chrome.tabs.getSelected(null,
      function (tab) {
        if (bIsInPageBlackList) {
          // 从网页黑名单里移除
          extension.removeBlackListPage(tab.url, tab.id);
        }

        if (bIsInWebsiteBlackList) {
          // 从网站黑名单里移除
          var tmpUrl = tab.url;
          var idx1 = tmpUrl.indexOf("://");
          if (idx1 >= 0) {
            var url;
            var idx2 = tmpUrl.indexOf("/", idx1 + 3);
            if (idx2 >= 0) {
              url = tmpUrl.substring(0, idx2);
            } else {
              url = tmpUrl;
            }
            extension.removeBlackListWebsite(url, tab.url, tab.id, true);
          }
        } else {
          if (!bIsInPageBlackList) {
            // 添加进网页黑名单
            extension.addBlackListPage(tab.url, tab.id);
          }
        }
      }
    );

    window.close();
  }
}

function OnClickThisWebsiteDisableThunder(e) {
  if (bPluginEnabled) {
    chrome.tabs.getSelected(null,
      function (tab) {
        var tmpUrl = tab.url;
        var idx1 = tmpUrl.indexOf("://");
        if (idx1 >= 0) {
          var url;
          var idx2 = tmpUrl.indexOf("/", idx1 + 3);
          if (idx2 >= 0) {
            url = tmpUrl.substring(0, idx2);
          } else {
            url = tmpUrl;
          }
          if (bIsInWebsiteBlackList) {
            // 从网站黑名单里移除
            extension.removeBlackListWebsite(url, tab.url, tab.id)
          } else {
            // 添加进网站黑名单
            extension.addBlackListWebsite(url, tab.id);
          }
        }
      }
    );

    window.close();
  }
}

function OnClickFeedback(e) {
  extension.onFeedback();
}

function OnClickDownloadNewClientInstallExe(e) {
  // var url = "http://plugin.xl7.xunlei.com/7.9/func/xl_ext_chrome_setup.exe";
  var url = "http://x.xunlei.com/";
  chrome.tabs.create({
    url: url
  },
    function () { }
  );
}

function ShowGuidePage() {
  var thunderChromeSupportNode = document.getElementById('ThunderChromeSupport');
  document.body.removeChild(thunderChromeSupportNode.parentNode);

  var moniterDynamicLinksNode = document.getElementById('MoniterDynamicLinks');
  document.body.removeChild(moniterDynamicLinksNode.parentNode);

  var thisPageDisableThunderNode = document.getElementById('ThisPageDisableThunder');
  document.body.removeChild(thisPageDisableThunderNode.parentNode);

  // 与ThisPageDisableThunder父节点相同
  // var thisWebsiteDisableThunderNode = document.getElementById('ThisWebsiteDisableThunder');
  // document.body.removeChild(thisWebsiteDisableThunderNode.parentNode);

  var feedbackNode = document.getElementById('Feedback');
  document.body.removeChild(feedbackNode.parentNode);

  var newTitleNode = document.createElement("p");
  newTitleNode.innerHTML = "<div class=\"guide\"><b><h3><font color='red'>迅雷下载支持异常</font></h3></b></div>";
  document.body.appendChild(newTitleNode)

  var newTextNode = document.createElement("p");
  newTextNode.innerHTML = "<div class=\"guide\">您可能没有安装迅雷，或已安装的迅雷不完整，请您下载安装最新版本的迅雷！<br>（安装完成后，请重启Chrome浏览器）</div>";
  document.body.appendChild(newTextNode)

  var downloadBtnNode = document.createElement("p");
  downloadBtnNode.setAttribute("align", "center");
  align = downloadBtnNode.attributes.getNamedItem("align").value = "center";
  downloadBtnNode.innerHTML = "<div class=\"downloadBtn\">立即下载</div>";
  document.body.appendChild(downloadBtnNode)
  downloadBtnNode.addEventListener('click', OnClickDownloadNewClientInstallExe);
}

function Init() {
  extension = chrome.extension.getBackgroundPage();

  if (extension.isException()) {
    ShowGuidePage();
    return;
  }

  bPluginEnabled = extension.isPluginEnabled();
  if (bPluginEnabled) {
    document.getElementById('ThunderChromeSupport').className = 'item item-select';

    var bUseChromeDownloadAPI = extension.isUseChromeDownloadAPI();
    if (bUseChromeDownloadAPI) {
      bMoniterDynamicLinks = extension.isMoniterDynamicLinks();
      if (bMoniterDynamicLinks) {
        document.getElementById('MoniterDynamicLinks').className = 'item item-select';
      }
    } else {
      document.getElementById('MoniterDynamicLinks').className = 'item-disable';
    }

    chrome.tabs.getSelected(null,
      function (tab) {
        bIsInWebsiteBlackList = extension.checkIsWebsiteInUserBlackList(tab.url);
        bIsInPageBlackList = extension.checkIsPageInUserBlackList(tab.url);
        if (bIsInWebsiteBlackList) {
          document.getElementById('ThisPageDisableThunder').className = 'item item-select';
          document.getElementById('ThisWebsiteDisableThunder').className = 'item item-select';
        } else {
          if (bIsInPageBlackList) {
            document.getElementById('ThisPageDisableThunder').className = 'item item-select';
          }
        }
      }
    );
  } else {
    document.getElementById('ThunderChromeSupport').className = 'item';
    document.getElementById('MoniterDynamicLinks').className = 'item-disable';
    document.getElementById('ThisPageDisableThunder').className = 'item-disable';
    document.getElementById('ThisWebsiteDisableThunder').className = 'item-disable';
  }
}

document.addEventListener('DOMContentLoaded',
  function () {
    document.getElementById('ThunderChromeSupport').addEventListener('click', OnClickThunderChromeSupport);
    document.getElementById('MoniterDynamicLinks').addEventListener('click', OnClickMoniterDynamicLinks);
    document.getElementById('ThisPageDisableThunder').addEventListener('click', OnClickThisPageDisableThunder);
    document.getElementById('ThisWebsiteDisableThunder').addEventListener('click', OnClickThisWebsiteDisableThunder);
    document.getElementById('Feedback').addEventListener('click', OnClickFeedback);

    Init();
  }
);