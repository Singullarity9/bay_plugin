"use strict";
class GoogleAnalyticsEvents {
  constructor() {
    (this.trackingID = "UA-94112226-8"),
      (this.analyticsPath = "https://www.google-analytics.com/collect"),
      (this.gaCIDStorageKey = "gaCID"),
      (this.gaCID = void 0),
      (this.chromeStoreID = "einnffiilpmgldkapbikhkeicohlaapj"),
      this.initClientID();
  }
  initClientID() {
    chrome.storage.local.get(this.gaCIDStorageKey, (e) => {
      e[this.gaCIDStorageKey]
        ? (this.gaCID = e[this.gaCIDStorageKey])
        : ((this.gaCID = this.uuidv4()),
          chrome.storage.local.set({ [this.gaCIDStorageKey]: this.gaCID }));
    });
  }
  send(e) {
    var t = new URLSearchParams();
    t.append("v", 1),
      t.append("tid", this.trackingID),
      t.append("cid", this.gaCID),
      t.append("t", "event"),
      t.append("ec", "SnovioExt"),
      t.append("ea", e),
      this.postData(this.analyticsPath, t);
  }
  async postData(e = "", t = {}) {
    await fetch(e, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: t,
    });
  }
  uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (e) =>
      (
        e ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (e / 4)))
      ).toString(16)
    );
  }
  getLangForGA() {
    return (
      { en_US: "en", pt_BR: "pt", zh_CN: "zh", uk: "ua" }[
        chrome.i18n.getMessage("@@ui_locale")
      ] ?? "en"
    );
  }
  getExtNameForGA() {
    return chrome.runtime.id === this.chromeStoreID
      ? "finder_new"
      : "finder_new_manual";
  }
}
