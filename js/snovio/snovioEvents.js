document.addEventListener("onUserListsChanged", (e) => {
  chrome.runtime.sendMessage({ needUpdateUserLists: !0 });
});
