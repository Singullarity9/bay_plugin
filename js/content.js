chrome.runtime.onMessage.addListener((e, n, t) => {
  "getInnerHTML" === e.method &&
    t({ data: document.all[0].innerHTML, method: "getInnerHTML" });
});
