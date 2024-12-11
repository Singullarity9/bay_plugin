async function loadUserLists(e, t) {
  var s = localStorage["lastUpdateList_" + e],
    a = localStorage["userList_" + e];
  if (t || !a || (s && 864e5 < new Date().getTime() - s))
    await updateUserLists(e, t);
  else {
    if (localStorage.needUpdateUserLists) return updateUserLists(e);
    $(window).trigger("userListsLoaded", [e, a]);
  }
}
async function updateUserLists(e, t) {
  var s = await apiGetListsByUserId({ type: e });
  s?.errors ||
    (s?.list &&
      ($(window).trigger("userListsLoaded", [e, JSON.stringify(s), t]),
      (localStorage["userList_" + e] = JSON.stringify(s)),
      (localStorage["lastUpdateList_" + e] = new Date().getTime()),
      (localStorage.needUpdateUserLists = 0)));
}
