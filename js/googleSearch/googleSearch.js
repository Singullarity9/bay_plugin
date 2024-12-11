const REG_GOOGLE_RESULT_URL = /<cite class=".+?">(.+?)<\/cite>/gi,
  REG_GOOGLE_RESULT_URL_TRIM = /(.+?)(<|$)/i;
var $domainEmails = $("#domainEmails"),
  $importOptions = $("#importOptions"),
  $importConfirm = $("#importConfirm"),
  $userPeopleSelect = $("#userPeopleSelect"),
  $userCompaniesSelect = $("#userCompaniesSelect"),
  $waitAnimation = $("#waitAnimation"),
  emailItemTemplate = $("#emailItemTemplate").html(),
  maDefaultListId = 0;
let googleResult = [];
var emailsOnly = !0,
  generic = !1,
  personal = !1,
  others = !1,
  max = 5;
function initChromeTabsQuery() {
  chrome.tabs.query({ active: !0, currentWindow: !0 }, (e) => {
    setEventsOnFooterDropdown(),
      $("#listNameInput").on("keyup", _keyupEvent),
      (maDefaultListId = localStorage[LS_LastPeopleListId] || 0),
      $userCompaniesSelect.on("change", "input[type=radio]", function () {
        $("#selectedItemUsersCompanyList").text($(this).attr("data-text")),
          (maDefaultListId = $userCompaniesSelect
            .find('input[name="usersList"]:checked')
            .val()),
          (localStorage[LS_LastCompanyListId] = maDefaultListId),
          hideDropdownList();
      }),
      $userPeopleSelect.on("change", "input[type=radio]", function () {
        $("#selectedItemUsersPeopleList").text($(this).attr("data-text")),
          (maDefaultListId = $userPeopleSelect
            .find('input[name="usersList"]:checked')
            .val()),
          (localStorage[LS_LastPeopleListId] = maDefaultListId),
          hideDropdownList();
      }),
      initChromeTabSendMessage(e[0]);
  });
}
function initChromeTabSendMessage(t = {}) {
  chrome.tabs.sendMessage(t.id, { method: "getInnerHTML" }, function (e) {
    e
      ? (getDomainsFromGoogleSearch(e.data, t.url),
        googleResult &&
          0 < googleResult.length &&
          (chrome.runtime.sendMessage({
            type: "ga",
            action: "bulkDomainSearchShow",
          }),
          renderDomains(googleResult)),
        (e = $(".footers-button")[0].offsetHeight || 0),
        initResizeObserver([$("#domainEmails")], $("#top")[0], {
          viewHeight: 580,
          otherElementsHeight: e,
        }))
      : ($(document.body).append(
          '<div class="main-body contacts-table scroll-y"><div class="pfe-alert pfe-alert--thirdy"><div class="pfe-alert__title"><span>' +
            getMessage(
              "somethingWentWrong",
              DefaultValuesLang.somethingWentWrong
            ) +
            ' </span><img src="../img/emodji-flushed.png" alt="emodji-flushed"></div><div class="pfe-alert__text">' +
            getMessage(
              "somethingWentWrongGoogleSearch",
              DefaultValuesLang.somethingWentWrongGoogleSearch
            ) +
            "</a></div></div></div>"
        ),
        $("#companyInfoBody").addClass("hidden"),
        $(".main-footer").addClass("hidden"),
        $("#domainEmails").addClass("hidden"));
  });
}
function getDomainsFromGoogleSearch(e = "") {
  var t,
    a,
    n = [];
  for (
    REG_GOOGLE_RESULT_URL.exec(e) ||
    (window.localStorage.setItem(LS_referrer, "googleSearch"),
    (window.location.href = "../html/popup.html"));
    (matches = REG_GOOGLE_RESULT_URL.exec(e));

  )
    matches[1] &&
      (t = REG_GOOGLE_RESULT_URL_TRIM.exec(matches[1]))[1] &&
      ((t = t[1]),
      (a = tldjs.getDomain(t)),
      -1 !== n.indexOf(a) ||
        !1 === isValidHttpUrl(t) ||
        isStringContainsCyrillic(t) ||
        (n.push(a), googleResult.push({ domain: a, url: t })));
}
function renderDomains(t) {
  $domainEmails.empty(),
    "free" === $("#next_button").data("tariff") && showMessageForFreeUser(),
    +localStorage.googleDescr ||
      ($domainEmails.append($("#descr")),
      $("#descr").on("click", () => {
        localStorage.googleDescr = +$("#neverShow").prop("checked");
      })),
    0 < t.length &&
      ($domainEmails.append(
        '<div class="pfe-title mt-0">' +
          getMessage(
            "company_foundOnPage",
            DefaultValuesLang.company_foundOnPage
          ) +
          "</div>"
      ),
      addSelectAll("#domainEmails"));
  for (let e = 0; e < t.length; e++) {
    var a = $(emailItemTemplate);
    a.find(".js-contact-email").text(t[e].domain),
      a.attr("id", "domain_" + e),
      $domainEmails.append(a);
  }
  reRenderCountOfSelectedItems($domainEmails, $("#selectAll")),
    changeSelectAllCheckStatus($domainEmails, $("#selectAll")),
    $("#completeSearchTemplate").removeClass("hidden"),
    $("#next_button").on("click", clickNextButton),
    $("#save_domains_button").on("click", clickShowDomainsButton);
}
function addSelectAll(e = "") {
  var t = $("#selectAllTemplate").html();
  $(e).append(t),
    $(e).on("change", '[name="selectAll"]', function () {
      var e = $(this),
        t = e.closest("section").find(".js-list-item"),
        a = e.is(":checked");
      t.find("input:checked").length === t.length
        ? (changeButtonsDisabledAttr(a, !0), t.each(updateItemCheckbox(a)))
        : (changeButtonsDisabledAttr(a, !1),
          t.each(updateItemCheckbox(!0)),
          e.prop("checked", !0),
          e.trigger("change")),
        reRenderCountOfSelectedItems(e.closest("section"), $("#selectAll"));
    }),
    $(e).on("change", '[name="foundEmails"]', function () {
      var e = $('#domainEmails input[name="foundEmails"]').length,
        t = $('#domainEmails input[name="foundEmails"]:checked').length;
      reRenderCountOfSelectedItems($("#domainEmails"), $("#selectAll")),
        changeSelectAllCheckStatus($("#domainEmails"), $("#selectAll")),
        e === t
          ? $('input[name="selectAll"]').prop("checked", !0)
          : (0 === t
              ? ($("#next_button").attr("disabled", !0),
                $("#save_domains_button").attr("disabled", !0),
                $("#btnSendDomains").attr("disabled", !0),
                $('[name="selectAll"]').prop("checked", !1))
              : ($("#next_button").attr("disabled", !1),
                $("#save_domains_button").attr("disabled", !1),
                $("#btnSendDomains").attr("disabled", !1)),
            ("free" !== $("#next_button").data("tariff") &&
              "error" !== $(".main-body").data("status")) ||
              $("#next_button").attr("disabled", !0));
    });
}
function changeButtonsDisabledAttr(e = !1, t = !1) {
  $("#next_button").attr("disabled", !e),
    $("#save_domains_button").attr("disabled", !e),
    $("#btnSendDomains").attr("disabled", !e),
    ("free" !== $("#next_button").data("tariff") &&
      "error" !== $(".main-body").data("status")) ||
      $("#next_button").attr("disabled", t);
}
async function clickNextButton(e) {
  $("#save_domains_button").addClass("hidden"),
    $("#next_button").attr("disabled", !0),
    await postFindContacts(getSelectedDomains().filter((e) => e));
}
function getSelectedDomains() {
  var e,
    t = [];
  for (e in googleResult)
    $("#domain_" + e).find("input")[0].checked &&
      t.push(googleResult[e].domain);
  return t;
}
async function postFindContacts(e = []) {
  e = { domains: e };
  try {
    var t = await fetch(getMainHost() + "/api/email-finder/find-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      }),
      a =
        t.url && t.url.match("url-emails")
          ? t.url
          : getMainHost() + "/url-emails";
    window.open(a, "_blank");
  } catch (e) {}
}
function clickShowDomainsButton() {
  (maDefaultListId = localStorage[LS_LastCompanyListId] || 0),
    $("#next_button").off("click"),
    $(window).on("userListsLoaded", function (e, t, a) {
      (userLists_companies = a),
        $userCompaniesSelect.on("change", function () {
          (maDefaultListId = $userCompaniesSelect
            .find('input[name="usersList"]:checked')
            .val()),
            (localStorage[LS_LastCompanyListId] = maDefaultListId);
        }),
        showAvailableLists(a, "userCompaniesSelect", maDefaultListId),
        $("#footer_domains").removeClass("hidden"),
        1 !== $("#refreshCompanySelect").data("has-event") &&
          $("#refreshCompanySelect").click(function (e) {
            $(this).parent().hasClass("pfe-select__static--disabled") ||
              ($(this).data("has-event", 1),
              e.stopPropagation(),
              $("#refreshCompanySelect").addClass("icon-refresh-animate"),
              updateUserLists("company", !0));
          }),
        (maDefaultListId = $userCompaniesSelect
          .find('input[name="usersList"]:checked')
          .val()),
        (localStorage[LS_LastCompanyListId] = maDefaultListId),
        $("#refreshCompanySelect").removeClass("icon-refresh-animate");
    }),
    loadUserLists("company", !0),
    $("#completeSearchTemplate").addClass("hidden"),
    $("#footer_domains").removeClass("hidden"),
    $("#btnSendDomains").on("click", clickSendDomainsButton),
    $("#dropdownListContainer").on("dblclick", showCreateListInput);
}
async function clickSendDomainsButton(a) {
  if (checkValidUserListName(a)) {
    $("#btnSendDomains").attr("disabled", !0);
    var n = $userCompaniesSelect.find('input[name="usersList"]:checked').val(),
      s = $userCompaniesSelect
        .find('input[name="usersList"]:checked')
        .data("text"),
      i = getNewUserList(),
      e = getParamsForCompanies(i, n, s),
      e = await apiCreateCompaniesByUrls(e);
    if (e && e.success) {
      $(window).trigger("contactsSaved", [a]);
      let e = "",
        t = "";
      i
        ? ((e = i),
          (t = APP_HOST + "/companies"),
          (i = $("#listNameInput").val()),
          checkIfNewUserListDuplicate(userLists_companies, i) &&
            (t += "/list/" + getDuplicateUserListID(userLists_companies, i)))
        : ((e = s), (t = APP_HOST + "/companies/list/" + n)),
        void addSavedListToSelectedDomains(e, t);
    } else
      $(a.target).button("reset"),
        e.code === ErrorListIdStatusCode
          ? (updateUserLists("company", !0),
            showError({
              message: getMessage(
                "selectAnotherList",
                DefaultValuesLang.selectAnotherList
              ),
              title: getMessage("cantFindList", DefaultValuesLang.cantFindList),
            }))
          : showError(e);
  }
}
function getParamsForCompanies(e = null, t = "", a = null) {
  var n = { urls: getSelectedUrls() };
  return e ? (n.listName = e) : t ? (n.listId = t) : a && (n.listName = a), n;
}
function showError(e) {
  var t;
  $("#footer_domains").addClass("hidden"),
    $domainEmails.addClass("hidden"),
    $importOptions.addClass("hidden"),
    $waitAnimation.addClass("hidden"),
    $importConfirm.addClass("hidden"),
    $("#error").removeClass("hidden"),
    toggleStatusAttribute(".main-body", "error"),
    e &&
      e.message &&
      ((t = '<span class="pfe-icon pfe-icon--warning"></span>'),
      (t += `<div>
          <h3>${
            e.title ||
            getMessage("somethingWentWrong", "Oops! Something went wrong")
          }</h3>
          <p>${e.message}</p>
        </div>`),
      $("#errorMessage").html(t)),
    checkAuthenticationUpdate(function () {
      showUserName();
    });
}
function addSavedListToSelectedDomains(e, t) {
  for (var a in googleResult)
    $("#domain_" + a).find("input")[0].checked &&
      $("#domain_" + a)
        .find(".js-contact-saved-list")
        .html(`<a href="${t}" target="_blank">${e}</a>`);
}
function getSelectedUrls() {
  var e,
    t = [];
  for (e in googleResult)
    $("#domain_" + e).find("input")[0].checked && t.push(googleResult[e].url);
  return t;
}
function isValidHttpUrl(e) {
  if (!1 === /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(e))
    return !1;
  let t;
  try {
    t = new URL(e);
  } catch (e) {
    return !1;
  }
  return "http:" === t.protocol || "https:" === t.protocol;
}
initPage(initChromeTabsQuery);
