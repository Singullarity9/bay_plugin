chrome.tabs.query({ active: !0, currentWindow: !0 }, (e) => {
  initPage();
});
