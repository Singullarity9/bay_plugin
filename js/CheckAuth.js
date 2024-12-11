const mainHost = "https://app.snov.io",
  mHost = "app.snov.io";
var bStartedCheckAuth = !1;
function parseCheckLogin(e, t) {
  function o(e) {
    chrome.cookies.set(
      {
        name: "token",
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
  var n = JSON.parse(e);
  n && n.result
    ? (n.name && n.name && (localStorage.userName = n.name),
      n.token
        ? chrome.cookies.set(
            {
              name: "token",
              url: mainHost,
              value: n.token,
              expirationDate: new Date() / 1e3 + 1209600,
              httpOnly: !0,
              secure: !0,
              sameSite: "no_restriction",
            },
            function (e) {
              chrome.cookies.get(
                { url: mainHost, name: "token" },
                function (e) {
                  e && e.value;
                }
              ),
                e
                  ? (bStartedCheckAuth = !1)
                  : chrome.cookies.set(
                      {
                        name: "token",
                        url: mainHost,
                        value: n.token,
                        expirationDate: new Date() / 1e3 + 1209600,
                        httpOnly: !0,
                        secure: !0,
                        sameSite: "no_restriction",
                      },
                      function (e) {
                        e
                          ? (bStartedCheckAuth = !1)
                          : setTimeout(o, 1e3, n.token);
                      }
                    );
            }
          )
        : (bStartedCheckAuth = !1),
      n.fingerprint &&
        chrome.cookies.set({
          name: "fingerprint",
          url: mainHost,
          value: n.fingerprint,
          expirationDate: new Date() / 1e3 + 1209600,
          httpOnly: !0,
          secure: !0,
        }),
      n.name && t && t())
    : (chrome.cookies.remove({ name: "token", url: mainHost }),
      chrome.cookies.remove({ name: "selector", url: mainHost }),
      t && t());
}
function checkLogin(e, t, o) {
  var n = "",
    a =
      ("" !== e && "" !== t && (n = "selector=" + e + "&token=" + t),
      new XMLHttpRequest());
  a.open("POST", mainHost + "/api/checkAuth", !0),
    (a.withCredentials = !0),
    a.overrideMimeType("text/xml"),
    a.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"),
    (a.onreadystatechange = function () {
      4 === a.readyState &&
        (200 === a.status
          ? parseCheckLogin(a.responseText, o)
          : (localStorage[new Date().toString() + "_checkAuthPost_ERROR"] =
              a.statusText));
    }),
    a.send(n);
}
function checkAuthenticationUpdate(t) {
  var o = (localStorage.userName = ""),
    n = "";
  chrome.cookies &&
    !bStartedCheckAuth &&
    ((bStartedCheckAuth = !0),
    chrome.cookies.get({ url: mainHost, name: "selector" }, function (e) {
      e
        ? ((o = e.value),
          chrome.cookies.get({ url: mainHost, name: "token" }, function (e) {
            e ? (n = e.value) : checkLogin(o, n, t),
              o && n && checkLogin(o, n, t);
          }))
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
    chrome.cookies.get({ url: mainHost, name: "selector" }, function (e) {
      e
        ? ((t = e.value),
          chrome.cookies.get({ url: mainHost, name: "token" }, function (e) {
            e && (o = e.value), checkLogin(t, o);
          }))
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
