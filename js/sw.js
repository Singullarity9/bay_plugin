"use strict";
importScripts(
  "./constants.js",
  "./common/common.js",
  "./apiMethods.js",
  "./background/newVersionChecker.js",
  "./background/googleAnalyticsEvents.js",
  "./background/newsChecker.js",
  "./background/blackFridayPromotion.js"
);
const newVerChecker = new VersionChecker(),
  gaEvent = new GoogleAnalyticsEvents(),
  newsInstance = new NewsChecker(APP_HOST, "finder"),
  blackFridayPromo = new BlackFridayPromotion(gaEventOnOpenBlackFridayPromoUrl);
function checkBlackFridayPromotion() {
  blackFridayPromo.checkConditions();
}
function gaEventOnOpenBlackFridayPromoUrl(e) {
  gaEvent.send(e);
}
chrome.runtime.onMessage.addListener(function (e, o, n) {
  return (
    e &&
      (e.wakeMeUp
        ? n({})
        : e.needUpdateUserLists
        ? (chrome.storage.local.set({ needUpdateUserLists: !0 }), n({}))
        : "ga" === e.type
        ? (gaEvent.send(e.action), n({}))
        : "showLastNews" === e.type
        ? (newsInstance.showLastNews(), n({}))
        : "checkNews" === e.type
        ? n({ isNeedToShowNews: newsInstance.isNeedToShowNews() })
        : e.checkIfNewVersion
        ? newVerChecker.checkFlagNewVersion((e) => {
            n(e);
          })
        : e.updateExtensionVersion
        ? (newVerChecker.updateExtensionVersion(), n({}))
        : e.checkPromotionForPopup
        ? (blackFridayPromo.checkPromotionForPopup(), n({}))
        : e.nowIsPromotionDate
        ? n({ nowIsPromotionDate: blackFridayPromo.nowIsPromotionDate() })
        : e.getPromoUrl && n({ promoUrl: blackFridayPromo.promoUrl })),
    !0
  );
}),
  chrome.runtime.setUninstallURL("https://app.snov.io/uninstall/email-finder"),
  chrome.runtime.onStartup.addListener(function () {
    setTimeout(
      checkBlackFridayPromotion,
      BlackFridayPromotion.DELAY_BETWEEN_SHOWING_PROMOTION_BF
    );
  }),
  chrome.runtime.onInstalled.addListener(function (e) {
    var o;
    "install" === e.reason
      ? (setTimeout(
          checkBlackFridayPromotion,
          BlackFridayPromotion.DELAY_BETWEEN_SHOWING_PROMOTION_BF
        ),
        (o =
          APP_HOST +
          "/register?ref=extension&signup_source=" +
          gaEvent.getExtNameForGA() +
          "&signup_page=triggered_by_chrome_install"),
        (o += "&lang=" + gaEvent.getLangForGA()),
        chrome.tabs.create({ url: o }),
        gaEvent.send("install"))
      : "update" === e.reason &&
        (setTimeout(
          checkBlackFridayPromotion,
          BlackFridayPromotion.DELAY_BETWEEN_SHOWING_PROMOTION_BF
        ),
        (o = chrome.runtime.getManifest().version) !== e.previousVersion) &&
        gaEvent.send("update_from_" + e.previousVersion + "_to_" + o);
  });
