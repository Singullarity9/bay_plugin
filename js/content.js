chrome.runtime.onMessage.addListener((e, n, t) => {
  "getInnerHTML" === e.method &&
    t({ data: document.all[0].innerHTML, method: "getInnerHTML" });
});

// 直接定义函数以供 executeScript 使用
function getPageHTML() {
  return document.documentElement.outerHTML;
}

chrome.runtime.sendMessage({ html: getPageHTML() });
