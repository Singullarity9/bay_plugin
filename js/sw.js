"use strict";
importScripts(
  "./constants.js",
  "./common/common.js",
  "./apiMethods.js",
  "./background/googleAnalyticsEvents.js"
);
const gaEvent = new GoogleAnalyticsEvents();
// chrome.runtime.onMessage.addListener(function (e, o, n) {
//   return (
//     e &&
//       (e.wakeMeUp
//         ? n({})
//         : e.needUpdateUserLists
//         ? (chrome.storage.local.set({ needUpdateUserLists: !0 }), n({}))
//         : "ga" === e.type
//         ? (gaEvent.send(e.action), n({}))
//         : "showLastNews" === e.type
//         ? (newsInstance.showLastNews(), n({}))
//         : "checkNews" === e.type
//         ? n({ isNeedToShowNews: newsInstance.isNeedToShowNews() })
//         : e.checkIfNewVersion
//         ? newVerChecker.checkFlagNewVersion((e) => {
//             n(e);
//           })
//         : e.updateExtensionVersion
//         ? (newVerChecker.updateExtensionVersion(), n({}))
//         : e.checkPromotionForPopup
//         ? (blackFridayPromo.checkPromotionForPopup(), n({}))
//         : e.nowIsPromotionDate
//         ? n({ nowIsPromotionDate: blackFridayPromo.nowIsPromotionDate() })
//         : e.getPromoUrl && n({ promoUrl: blackFridayPromo.promoUrl })),
//     !0
//   );
// }),
// chrome.runtime.setUninstallURL("https://app.snov.io/uninstall/email-finder"),
chrome.runtime.onInstalled.addListener(function (e) {
  var o;
  "install" === e.reason
    ? ((o = "https://mktest.beiniuyun.cn/#/register"),
      chrome.tabs.create({ url: o }),
      gaEvent.send("install"))
    : "update" === e.reason &&
      (o = chrome.runtime.getManifest().version) !== e.previousVersion &&
      gaEvent.send("update_from_" + e.previousVersion + "_to_" + o);
});
