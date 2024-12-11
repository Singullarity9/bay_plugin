"use strict";
class BlackFridayPromotion {
  constructor(e) {
    var o = chrome.i18n.getMessage("@@ui_locale", "en_US"),
      e =
        ((this.startDate = new Date(
          "Mon Nov 25 2024 12:00:00 GMT+0200"
        ).getTime()),
        (this.finishDate = new Date(
          "Tue Dec 3 2024 23:00:00 GMT+0200"
        ).getTime()),
        (this.promotionCompletedKey = "blackFridayPage2024"),
        (this.storageKeyViewedCounter = "blackFridayPage2024ViewedCounter"),
        (this.cbGoogleAnalytics = e),
        "?utm_source=extension&utm_medium=referral&utm_campaign=black-friday-2024&utm_content=bf-landing");
    (this.localizedLinks = {
      en_US: "https://snov.io/black-friday" + e + "&lang=en",
      pt_BR: "https://snov.io/br/black-friday" + e + "&lang=br",
      zh_CN: "https://snovio.cn/black-friday" + e + "&lang=zh",
      es: "https://snov.io/es/black-friday" + e + "&lang=es",
      uk: "https://snov.io/ua/black-friday" + e + "&lang=ua",
    }),
      (this.promoUrl = this.localizedLinks[o] ?? this.localizedLinks.en_US);
  }
  static DELAY_BETWEEN_SHOWING_PROMOTION_BF = 15e3;
  nowIsPromotionDate() {
    var e = Date.now();
    return !(e < this.startDate || e > this.finishDate);
  }
  async checkConditions() {
    this.nowIsPromotionDate() &&
      !(await chrome.storage.local.get(this.promotionCompletedKey))[
        this.promotionCompletedKey
      ] &&
      (await this.checkPromotionBehavior(),
      (await this.isAlreadyOpenedBF()) || this.openTabWithPromoUrl(),
      this.cbGoogleAnalytics) &&
      this.cbGoogleAnalytics(this.promotionCompletedKey);
  }
  async isAlreadyOpenedBF() {
    var e;
    for (e of await chrome.tabs.query({}))
      if (e.url.includes("snov.io/black-friday")) return !0;
  }
  async checkPromotionForPopup() {
    this.nowIsPromotionDate() && (await this.checkPromotionBehavior());
  }
  async checkPromotionBehavior() {
    var e = await chrome.storage.local.get([
      this.promotionCompletedKey,
      this.storageKeyViewedCounter,
    ]);
    e[this.promotionCompletedKey]
      ? e[this.storageKeyViewedCounter] ||
        (await updateErrorBadge(-1),
        chrome.storage.local.set({ [this.storageKeyViewedCounter]: !0 }))
      : (await updateErrorBadge(1),
        chrome.storage.local.set({ [this.promotionCompletedKey]: !0 }));
  }
  openTabWithPromoUrl() {
    chrome.tabs.create({ url: this.promoUrl });
  }
}
