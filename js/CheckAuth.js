const mainHost = "https://mktest.beiniuyun.cn/";
var bStartedCheckAuth = !1;
function parseCheckLogin(e, t, response, o) {
  function o(e) {
    chrome.cookies.set(
      {
        name: "ACCESS_TOKEN",
        url: mainHost,
        value: e,
        expirationDate: new Date() / 1e3 + 1209600,
        httpOnly: !0,
        secure: !0,
        sameSite: "no_restriction",
      },
      function (e) {
        bStartedCheckAuth = !1;
      }
    );
  }
  var n = JSON.parse(response);
  if (!(n && n.code === 0)) {
    (bStartedCheckAuth = !1), e && o && o();
  }
}
function checkLogin(e, t, o) {
  var n = "",
    a =
      ("" !== e && "" !== t && (n = "TENANT_ID=" + e + "&ACCESS_TOKEN=" + t),
      new XMLHttpRequest());
  a.open(
    "GET",
    "https://mktest.beiniuyun.cn/admin-api/system/member/rights-user/get?rightsType=6",
    !0
  ),
    (a.withCredentials = !0),
    a.overrideMimeType("text/xml");
  if (e && t) {
    a.setRequestHeader("tenant-id", `${e}`);
    a.setRequestHeader("Authorization", `Bearer ${t}`);
  }
  a.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"),
    (a.onreadystatechange = function () {
      4 === a.readyState &&
        (200 === a.status
          ? parseCheckLogin(e, t, a.responseText, o)
          : (localStorage[new Date().toString() + "_checkAuthPost_ERROR"] =
              a.statusText));
    }),
    a.send(n);
}
function checkAuthenticationUpdate(t) {
  var o = (localStorage.userName = "用户名称U"),
    n = "";
  chrome.cookies &&
    !bStartedCheckAuth &&
    ((bStartedCheckAuth = !0),
    chrome.cookies.get({ url: mainHost, name: "TENANT_ID" }, function (e) {
      e
        ? ((o = e.value),
          chrome.cookies.get(
            { url: mainHost, name: "ACCESS_TOKEN" },
            function (e) {
              e ? (n = e.value) : checkLogin(o, n, t),
                o && n && checkLogin(o, n, t);
            }
          ))
        : checkLogin(o, n, t);
    }));
}
function checkAuthentication() {
  localStorage.host = mainHost;
  var t = (localStorage.userName = ""),
    o = "";
  chrome.cookies &&
    !bStartedCheckAuth &&
    ((bStartedCheckAuth = !0),
    chrome.cookies.get({ url: mainHost, name: "TENANT_ID" }, function (e) {
      e
        ? ((t = e.value),
          chrome.cookies.get(
            { url: mainHost, name: "ACCESS_TOKEN" },
            function (e) {
              e && (o = e.value), checkLogin(t, o);
            }
          ))
        : checkLogin(t, o);
    }));
}
chrome.runtime &&
  (chrome.runtime.onStartup.addListener(function () {
    checkAuthentication();
  }),
  chrome.runtime.onInstalled.addListener(function () {
    checkAuthentication();
  }));
