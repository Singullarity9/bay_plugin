"use strict";
class VersionChecker {
  constructor() {
    (this.chromeStoreId = "einnffiilpmgldkapbikhkeicohlaapj"),
      (this.urlForCheckLastVersion =
        "https://snov.io/knowledgebase/ext/extension.json"),
      (this.checkTimeout = 72e5),
      (this.newVersionExistKey = "newVersionAvailable"),
      (this.pushDateKey = "lastPushDate"),
      (this.notificationId = "NEW_VERSION"),
      this.init();
  }
  init() {
    if (!0 === this.checkIsFromStore()) return null;
    this.runAndCheck();
  }
  async runAndCheck() {
    var e = await this.getLastVersion();
    if (!this.compareIfNewVersion(chrome.runtime.getManifest().version, e))
      return (
        this.removeFlagNewVersion(),
        setTimeout(this.runAndCheck.bind(this), this.checkTimeout),
        null
      );
    this.setFlagNewVersion(),
      this.setAppIcon(!0),
      this.checkIfNeedPushAboutNewVersion(),
      setTimeout(this.runAndCheck.bind(this), this.checkTimeout);
  }
  async getLastVersion() {
    return (await (await fetch(this.urlForCheckLastVersion)).json())
      .finder_version;
  }
  compareIfNewVersion(e, t) {
    var s = e.split("."),
      i = t.split(".");
    for (let e = 0; e < s.length; e++) {
      if (+i[e] > +s[e]) return !0;
      if (+i[e] < +s[e]) return !1;
    }
    return !1;
  }
  checkIsFromStore() {
    return chrome.runtime.id === this.chromeStoreId;
  }
  checkIfNeedPushAboutNewVersion() {
    this.onePushInDay((e) => {
      e && this.sendPushNotification();
    });
  }
  onePushInDay(t) {
    chrome.storage.local.get(this.pushDateKey, (e) => {
      e = e[this.pushDateKey];
      (e && Date.now() - +e < 864e5) ||
        (chrome.storage.local.set({ [this.pushDateKey]: Date.now() }), t(!0));
    });
  }
  sendPushNotification() {
    var e = chrome.i18n.getMessage("appName"),
      t = chrome.i18n.getMessage(
        "newVersion_contextMessage",
        "Please update your extension."
      ),
      s = chrome.i18n.getMessage(
        "newVersion_message",
        "A new updated version of Snov.io Email Finder is already available. Download now."
      ),
      i = chrome.i18n.getMessage("newVersion_buttonUpdate", "Download"),
      o = chrome.i18n.getMessage("newVersion_buttonClose", "Close");
    chrome.notifications.create(this.notificationId, {
      type: "basic",
      iconUrl: "../img/48.png",
      title: e,
      contextMessage: t,
      message: s,
      requireInteraction: !0,
      buttons: [{ title: i }, { title: o }],
    }),
      chrome.notifications.onButtonClicked.addListener((e, t) => {
        if (e !== this.notificationId) return null;
        0 === t &&
          chrome.tabs.create(
            {
              url: chrome.i18n.getMessage(
                "newVersion_updateUrl",
                "https://snov.io/knowledgebase/how-to-manually-update-snov-io-email-finder-chrome-extension/"
              ),
            },
            function (e) {}
          ),
          1 === t && chrome.notifications.clear(e);
      });
  }
  setAppIcon(e) {
    e && showErrorToIconBadge("1");
  }
  updateExtensionVersion() {
    chrome.tabs.create({
      url: chrome.i18n.getMessage(
        "newVersion_updateUrl",
        "https://snov.io/knowledgebase/how-to-manually-update-snov-io-email-finder-chrome-extension/"
      ),
    }),
      this.removeFlagNewVersion(),
      chrome.action.setBadgeText({ text: "" });
  }
  setFlagNewVersion() {
    chrome.storage.local.set({ [this.newVersionExistKey]: !0 });
  }
  checkFlagNewVersion(t) {
    chrome.storage.local.get(this.newVersionExistKey, (e) => {
      t(!0 === e[this.newVersionExistKey]);
    });
  }
  removeFlagNewVersion() {
    chrome.storage.local.remove(this.newVersionExistKey);
  }
}
