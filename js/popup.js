//常量
const APP_HOST = "https://app.snov.io",
  HOST_URL = "https://mk.beiniuai.com/",
  NEW_VERSION_UPDATE_URL =
    "https://snov.io/knowledgebase/how-to-manually-update-li-prospect-finder-chrome-extension/",
  NO_CHANGING_STATUSES = ["error", "warning", "no_login", "no_login_twitter"],
  ErrorNotAuthStatusCode = 1,
  ErrorParametersStatusCode = 4,
  ErrorListIdStatusCode = 6,
  ErrorPaidStatusCode = 8;
//通用方法
function showErrorContent(t = "") {
  $("#error")
    .html("<div>" + t + "</div>")
    .removeClass("hidden"),
    $("#prospectsContainer").hide(),
    $("#domainEmails.domain-page").hide();
}
function debounce(i, a) {
  return function (...t) {
    var l = this.lastCall;
    (this.lastCall = Date.now()),
      l && this.lastCall - l <= a && clearTimeout(this.lastCallTimer),
      (this.lastCallTimer = setTimeout(() => i.apply(null, t), a));
  };
}

// common.js
const LS_LastPeopleListId = "lastPeopleListId",
  LS_LastCompanyListId = "lastCompanyListId",
  LS_referrer = "referrer",
  CHROME_STORE_ID = "einnffiilpmgldkapbikhkeicohlaapj";
let isAuth = !1,
  lowBalance = !1,
  userLists_prospects,
  userLists_companies;

async function initPage(e = () => {}) {
  console.log("启动成功!!!");
  appendHeader(),
    localizeHtmlCommon(),
    addExtensionVersionToHeader(),
    addEventListenersToHeader(),
    await handlePromotion(),
    await getUserBalance(),
    addChromeSendMessageCheckNews(),
    (await checkForNewExtensionVersion()) || e();
}
function getMainHost() {
  return "https://app.snov.io";
}
function getMessage(e, t, a) {
  let n = "";
  return (n =
    !(n = a
      ? (Number.isInteger(a) && (a = a.toString()),
        chrome.i18n.getMessage(e, a))
      : chrome.i18n.getMessage(e)) && t
      ? t
      : n);
}
async function appendHeader() {
  var e = `
        <div class="header__container">
            <div class="header__logo">
                <a href="${HOST_URL}" target="_blank">
                    <img src="../img/svg/logo.svg" alt="snov.io">
                </a>
            </div>
            <div class="header__content">
                <a id='black-friday' target="_blank" class="header__content-link hidden">
                    <img src="../img/svg/gift.svg" alt="Black Friday promotion">
                </a>  
                <a id="companiesHistory" href="${APP_HOST}/companies/history" target="_blank" class="header__content-link" title="${getMessage(
    "searchHistory",
    "Сompany search history"
  )}">
                    <img src="../img/svg/history.svg" alt="history">
                </a>   
                <div id="help" class="header__content-link" title="${getMessage(
                  "help",
                  "Help"
                )}">
                    <img src="../img/svg/support.svg" alt="tutorial">
                </div>
                <div id="showLastNews" class="header__content-link hidden" title="${getMessage(
                  "unreadMessage",
                  "News and updates"
                )}">
                    <img src="../img/svg/message.svg" alt="message">
                </div>
                <div class="header__content-link hidden" id="downloadNewVersion" title="${getMessage(
                  "unreadMessage",
                  "News and updates"
                )}">
                    <img src="../img/svg/message.svg" alt="message">
                </div>    
                <a href="${APP_HOST}/register" target="_blank" class="header__content-link sign-up hidden regLink" id="signUpLink">
                    ${getMessage("signUp", "Sign up")}
                </a>   
                <a href="${APP_HOST}/account/profile" target="_blank" class="header__content-link loginLink">
                    <img src="../img/svg/user.svg" alt="user-icon" title="${getMessage(
                      "myAccount",
                      "My account"
                    )}">
                    <span id="userName" class="hidden"></span>
                </a>
            </div>
        </div>`;
  $(".main-header").append(e);
}
function addEventListenersToHeader() {
  $("#help").click(() => {
    chrome.tabs.create({
      url: getMessage(
        "howToUseExtensionUrl",
        "https://snov.io/knowledgebase/knowledgebase/how-to-use-snovio-extension-for-chrome/"
      ),
    });
  }),
    $("#showLastNews").click(() => {
      chrome.runtime.sendMessage({ type: "showLastNews" });
    });
}
async function addChromeSendMessageCheckNews() {
  chrome.runtime.sendMessage({ wakeMeUp: !0 }, (e) => {
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: "checkNews" }, (e) => {
        e && e.isNeedToShowNews && $("#showLastNews").removeClass("hidden");
      });
    }, 1e3);
  });
}
async function checkForNewExtensionVersion() {
  var e = await chrome.runtime.sendMessage({ checkIfNewVersion: !0 });
  return (
    e &&
      ($("#downloadNewVersion").removeClass("hidden"),
      $("#showLastNews").addClass("hidden"),
      showNewVersionBanner(),
      $("#downloadNewVersion").click(() => {
        $("#downloadNewVersion").addClass("hidden"),
          chrome.runtime.sendMessage({ updateExtensionVersion: !0 });
      })),
    e
  );
}
function addExtensionVersionToHeader() {
  var e = document.createElement("div");
  (e.innerText = "v" + chrome.runtime.getManifest().version),
    e.classList.add("label-version"),
    $(".main-header").append(e);
}
function getAuthUrl(e) {
  e =
    APP_HOST +
    "/" +
    e +
    "?ref=extension&signup_source=" +
    getExtNameForGA() +
    "&signup_page=extension_window";
  return (e += "&lang=" + getLangForGA());
}
async function handlePromotion() {
  chrome.runtime.sendMessage({ checkPromotionForPopup: !0 });
  var e = (await chrome.runtime.sendMessage({ nowIsPromotionDate: !0 }))[
      "nowIsPromotionDate"
    ],
    t = (await chrome.runtime.sendMessage({ getPromoUrl: !0 }))["promoUrl"];
  e &&
    ($("#black-friday").removeClass("hidden"),
    $("#black-friday").attr("href", t));
}
function showUserName() {
  localStorage.userName &&
    $("#userName").parent().attr("title", localStorage.userName);
}
function getLangForGA() {
  return (
    { en_US: "en", pt_BR: "pt", zh_CN: "zh", uk: "ua" }[
      getMessage("@@ui_locale")
    ] ?? "en"
  );
}
function getExtNameForGA() {
  return chrome.runtime.id === CHROME_STORE_ID
    ? "finder_new"
    : "finder_new_manual";
}
function findDescrByRegEx(e, t, a = !1) {
  e = e.match(t);
  if (!e || 0 === e.length) return "";
  let n = e[1] ?? e[2] ?? "";
  return (n = n.trim()), !0 === a ? n : convertHtmlToText(n);
}
function getListNameById(t, a) {
  t = JSON.parse(t);
  var n = [],
    s = $(".js-contact-saved-list").data("section");
  if (t && t.listTeam)
    for (let e = t.listTeam.length - 1; 0 <= e; e--)
      0 <= a.indexOf(t.listTeam[e].id) &&
        n.push(getLinkToList(s, t.list[e], !0));
  if (t && t.list)
    for (let e = t.list.length - 1; 0 <= e; e--)
      0 <= a.indexOf(t.list[e].id) && n.push(getLinkToList(s, t.list[e]));
  return n;
}
function getFistListAndCountById(e, t) {
  e = JSON.parse(e);
  let a = "";
  var n = $(".js-contact-saved-list").data("section"),
    s = [];
  let i = [];
  e && e.listTeam && (i = [...e.listTeam]),
    e && e.list && (i = [...i, ...e.list]);
  for (let e = 0; e < i.length; e++)
    0 <= t.indexOf(i[e].id) &&
      (a.length ? s.push(i[e].name) : (a += getLinkToList(n, i[e])));
  return (
    s.length &&
      (a += `<span class="count" title="${s.join(", ")}">+${s.length}</span>`),
    a
  );
}
function getLinkToList(e, t, a) {
  var n;
  if (t)
    return (
      (n = t.name.trim()),
      (t = t.id),
      `<a target="_blank" 
                href="${APP_HOST}/${e || "prospects"}/list/${t}" 
                ${n && 15 < n.length ? 'title="' + n + '"' : ""}
                >${a ? n + " (team)" : n}</a>`
    );
}
function showAvailableLists(e, t, a, n) {
  showStars();
  var s = document.getElementById(t);
  (e = JSON.parse(e)) || e.list
    ? (n ||
        (localStorage.userName
          ? showUserName()
          : checkAuthenticationUpdate(function () {
              showUserName();
            })),
      fillCustomSelect(s, e, t, a))
    : ((localStorage.needUpdateUserLists = 1),
      (localStorage.userName = ""),
      showUserName(),
      checkAuthenticationUpdate(function () {
        showUserName();
      })),
    $("#dropdownListContainer").on("dblclick", showCreateListInput);
}
function fillCustomSelect(n, e, s, i) {
  $("#" + s).empty(),
    e.list.forEach(function (e, t) {
      var a = e.campaign ? e.name + " (drip)" : e.name,
        t =
          ((0 !== t && i != e.id) ||
            $(
              "userCompaniesSelect" === s
                ? "#selectedItemUsersCompanyList"
                : "#selectedItemUsersPeopleList"
            ).text(a),
          $("<label></label>")
            .addClass("pfe-select__dropdown-item")
            .append(
              $("<input/>")
                .attr("type", "radio")
                .attr("name", "usersList")
                .attr("value", e.id)
                .attr("data-value", e.id)
                .attr("data-text", a)
                .attr("data-list-text", e.name)
                .attr("data-type", e.type)
                .attr("checked", 0 === t || i == e.id)
            )
            .append($("<span></span>").text(a)));
      20 < e.name.length && t.attr("title", a),
        t.click(function () {
          0 < $(this).find("input:checked").length && hideDropdownList();
        }),
        n.append(t[0]);
    });
}
function show(e, t) {
  if (e) {
    e = e.length ? e : [e];
    for (var a = 0; a < e.length; a++) e[a].style.display = t || "block";
  }
}
function hide(e) {
  e = e.length ? e : [e];
  for (var t = 0; t < e.length; t++) e[t].style.display = "none";
}
function setEventsOnFooterDropdown() {
  $(".js-toggle-new-list").on("click", toggleDropdownList),
    $(".js-show-add-new-list").on("click", showCreateListInput),
    $(".js-close-add-new-list").on("click", hideCreateListInput),
    $(document).mouseup(function (e) {
      0 === $(".dropdownListContainer").has(e.target).length &&
        ($(".js-dropdown-list-container").addClass("hidden"),
        $(".js-footer").removeClass("footer-offset-top"));
    });
}
function toggleDropdownList() {
  $(".js-toggle-new-list").hasClass("pfe-select__static--disabled") ||
    (document.querySelector(".pfe-select__dropdown-container input:checked") &&
      (document
        .querySelector(".pfe-select__dropdown-container input:checked")
        .parentElement.scrollIntoView(),
      $(".js-dropdown-list-container").toggleClass("hidden"),
      checkHeightBody()));
}
function checkHeightBody() {
  $(".js-footer").hasClass("footer-offset-top")
    ? $(".js-footer").removeClass("footer-offset-top")
    : $("body").height() < 225 && $(".js-footer").addClass("footer-offset-top");
}
function hideDropdownList() {
  $(".js-dropdown-list-container").addClass("hidden"),
    $(".js-footer").removeClass("footer-offset-top");
}
function showCreateListInput() {
  $(".js-toggle-new-list").hasClass("pfe-select__static--disabled") ||
    ($("#listNameInput").attr(
      "placeholder",
      getMessage("nameYourList", DefaultValuesLang.nameYourList.message)
    ),
    $(".js-dropdown-list-container").addClass("hidden"),
    $(".js-add-new-list-container").removeClass("hidden"),
    $(".js-footer").removeClass("footer-offset-top"),
    setTimeout(() => {
      $("#listNameInput").focus().select();
    }, 100));
}
function hideCreateListInput() {
  $(".js-add-new-list-container").addClass("hidden");
}
function toggleStatusClass(e, t) {
  $(e).removeClass("processing saved error").addClass(t);
}
function toggleClassNative(e, t) {
  e = document.getElementById(e);
  e.classList.remove("processing"),
    e.classList.remove("saved"),
    e.classList.remove("error"),
    e.classList.add(t);
}
function checkIfNewUserListDuplicate(e = "{}", t = "") {
  e = JSON.parse(e);
  return !(
    (!Object.keys(e).length && !e.list) ||
    !t ||
    !e.list.find((e) => e.name === t)
  );
}
function getDuplicateUserListID(e = "{}", t = "") {
  e = JSON.parse(e).list.find((e) => e.name === t);
  return String(e.id);
}
function convertHtmlToText(e) {
  return (e =
    e &&
    (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = e.replace(
      /<br>/gi,
      "\n"
    )).replace(/<br\s\/>/gi, "\n")).replace(/<br\/>/gi, "\n")).replace(
      / +(?= )/g,
      ""
    )).replace(/&nbsp;/gi, " ")).replace(/&amp;/gi, "&")).replace(
      /&quot;/gi,
      '"'
    )).replace(/&lt;/gi, "<")).replace(/&gt;/gi, ">")).replace(
      /<.*?>/gi,
      ""
    )).replace(/%20/gi, " "));
}
function truncText(e, t) {
  var a = "";
  return e.length > t && (a = "..."), e.substring(0, t) + a;
}
var invalidLocalParts = [
  "the",
  "2",
  "3",
  "4",
  "123",
  "20info",
  "aaa",
  "ab",
  "abc",
  "acc",
  "acc_kaz",
  "account",
  "accounts",
  "accueil",
  "ad",
  "adi",
  "adm",
  "an",
  "and",
  "available",
  "b",
  "c",
  "cc",
  "com",
  "domain",
  "domen",
  "email",
  "fb",
  "foi",
  "for",
  "found",
  "g",
  "get",
  "h",
  "here",
  "includes",
  "linkedin",
  "mailbox",
  "more",
  "my_name",
  "n",
  "name",
  "need",
  "nfo",
  "ninfo",
  "now",
  "o",
  "online",
  "post",
  "rcom.TripResearch.userreview.UserReviewDisplayInfo",
  "s",
  "sales2",
  "test",
  "up",
  "we",
  "www",
  "xxx",
  "xxxxx",
  "y",
  "username",
  "firstname.lastname",
];
function prepareEmails(e, t) {
  for (var a = [], n = 0; n < e.length; n++) {
    var s,
      i = e[n].toLowerCase().trim();
    a.indexOf(i) < 0 &&
      ((t && i.indexOf(t) < 1) ||
        ".png" === (s = i.slice(-4)) ||
        ".jpg" === s ||
        ".gif" === s ||
        ".css" === s ||
        ".js" === i.slice(-3) ||
        ((s = (s = (s = i.replace(/^(x3|x2|u003)[b|c|d|e]/i, "")).replace(
          /^sx_mrsp_/i,
          ""
        )).replace(/^3a/i, "")) !== i &&
          -1 ==
            (i = s).search(
              /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/i
            )) ||
        -1 != i.search(/(no|not)[-|_]*reply/i) ||
        -1 != i.search(/mailer[-|_]*daemon/i) ||
        -1 != i.search(/reply.+\d{5,}/i) ||
        -1 != i.search(/\d{13,}/i) ||
        0 < i.indexOf(".crx1") ||
        0 < i.indexOf("nondelivery") ||
        0 < i.indexOf("@linkedin.com") ||
        0 < i.indexOf("@linkedhelper.com") ||
        0 < i.indexOf("feedback") ||
        0 < i.indexOf("notification") ||
        ((s = i.substring(0, i.indexOf("@"))),
        -1 === invalidLocalParts.indexOf(s) &&
          "" !== i &&
          -1 == a.indexOf(i) &&
          a.push(i)));
  }
  return a;
}
function searchEmailsO(e, t) {
  e = e.match(
    /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi
  );
  return !isAuth && e?.length
    ? prepareEmails(e, t).map(blurEmailName)
    : e
    ? prepareEmails(e, t)
    : void 0;
}
async function getUserBalance() {
  var t = await apiGetUserBalance();
  if (t.success)
    return t.balance && t.pricing_plan_credits
      ? ((isAuth = !0),
        $("#next_button").attr("data-tariff", t.pricing_plan_type),
        $("#companyInfoBody").attr("data-tariff", t.pricing_plan_type),
        "pay" === t.pricing_plan_type &&
          $("#next_button").attr({
            disabled: !1,
            title: getMessage(
              "titleFindContacts",
              "Search for employee data of selected companies"
            ),
          }),
        addEventsAlerts(!0),
        setUserProgress(
          parseFloat(t.balance),
          parseFloat(t.pricing_plan_credits)
        ),
        void (t.username && (localStorage.userName = t.username)))
      : void (t.code === ErrorNotAuthStatusCode && showLoginBtn());
  if (t?.code === ErrorNotAuthStatusCode)
    showLoginBtn(),
      toggleStatusAttribute(".main-body", "no_login"),
      $(".main-footer").hide(),
      $(".js-footer").addClass("hidden"),
      $("#completeSearchTemplate").hide();
  else {
    var a =
      !$("body").data("page") || "yelp-company" !== $("body").data("page");
    if (t?.code === ErrorPaidStatusCode && a) {
      let e = t.description;
      (lowBalance = !0),
        setUserProgress(
          parseFloat(t.balance),
          parseFloat(t.pricing_plan_credits)
        ),
        t.alias.includes("credits_reached") &&
          ((a = APP_HOST + "/pricing-plans"),
          (e += `<a href="${a}" target="_blank" class="pfe-button pfe-button--primary">
                    <img src="../img/svg/star.svg" alt="" class="icon icon--up">
                    ${getMessage("upgradePlan", "Upgrade my plan")}</a>`)),
        toggleStatusAttribute(".main-body", "error"),
        $("#domainEmails").css({ maxHeight: "250px" }),
        showErrorContent(e),
        $("#next_button").attr({
          disabled: !0,
          "data-tariff": t.pricing_plan_type,
          title: getMessage(
            "hintFreeTariffBS",
            "Bulk search is only available to premium users"
          ),
        }),
        addEventsAlerts(!1),
        $(".people-list").addClass("people-list--small");
    }
    $(".js-footer")
      .find("button")
      .each(function () {
        "yelp-company" !== $(this).data("page") &&
          "google-search-companies" !== $(this).data("page") &&
          $(this).attr("disabled", !0);
      });
  }
}
function setUserProgress(e, t) {
  var a = $("#userBalance"),
    n = $("#userBalanceBar"),
    s = (100 * (t - (localStorage.user_balance = e))) / t;
  n.removeClass("hidden"),
    n.css("width", s + "%"),
    a.text(
      getMessage("creditsUsed", "Credits used") +
        " " +
        (t - e).toFixed(1) +
        " / " +
        t
    ),
    (99 < s || e < 1) && n.addClass("credits-bar__progress--error");
}
function getUILanguage() {
  return chrome.i18n.getUILanguage().toLowerCase().replace("-", "_");
}
function toggleStatusAttribute(e, t) {
  var a = $(e).attr("data-status");
  1 !== NO_CHANGING_STATUSES.indexOf(a) &&
    $(e).each(function () {
      $(this).hasClass("no-change-status") || $(this).attr("data-status", t);
    });
}
function showLoginBtn() {
  (localStorage.userName = ""),
    $("#userName")
      .parent()
      .addClass("pfe-button pfe-button--primary pfe-button--small"),
    $("#userName").prev().attr("src", "../img/svg/user-white.svg"),
    $("#userName").text(getMessage("login", "Log in")).removeClass("hidden"),
    $(".regLink").attr("href", getAuthUrl("register")),
    $(".loginLink").attr("href", getAuthUrl("login")),
    $("#companiesHistory").addClass("hidden"),
    $("#signUpLink").removeClass("hidden"),
    $(".js-footer").addClass("hidden");
}
function showNotLoginTwitter() {
  toggleStatusAttribute(".main-body", "no_login_twitter"),
    $("#warningLoginTwitter").removeClass("hidden"),
    $("#peopleList").addClass("hidden"),
    $("#warning2").addClass("hidden"),
    $("#errorTemplates").removeClass("pb-0"),
    $(".main-footer").addClass("hidden"),
    $(".pfe-profile").addClass("hidden");
}
function fillContactSavedList(a, e, n) {
  let s = -1,
    i = 0,
    r = "";
  a.html(""),
    e.forEach((e, t) => {
      if (0 < (n -= $(e).text().length) || 0 === t)
        return a.append(e), (s = t), (i = n), (n -= 3), !1;
      r += e;
    }),
    s < e.length - 1 &&
      a.append(`
            <div class="pfe-profile__list-not-fit">
                <span class="pfe-profile__list-count">+${
                  e.length - s - 1
                }</span>
                <div class="pfe-profile__list-dropdown" style="right:  ${
                  "-" + 5 * i + "px"
                }">
                    ${r}
                </div>
            </div>`);
}
function addEventsAlerts(e) {
  e &&
    1 !== $(".js-toggle-alert").data("event") &&
    $(".js-toggle-alert").on("click", toggleAlert).attr("data-event", 1),
    e ||
      ($(".js-toggle-alert").parent().addClass("not-allowed"),
      $(".social-link").click(function (e) {
        e.preventDefault();
      }));
}
function toggleAlert() {
  $(this).hasClass("closed")
    ? ((localStorage["LS_hidden_" + $(this).data("key")] = !1),
      $(this).parent().find(".pfe-alert__text").slideDown(150))
    : ((localStorage["LS_hidden_" + $(this).data("key")] = !0),
      $(this).parent().find(".pfe-alert__text").slideUp(150)),
    $(this).toggleClass("closed"),
    $(this).parent().toggleClass("closed");
}
function getNewUserList() {
  let e = null;
  return (e = $(".js-add-new-list-container").hasClass("hidden")
    ? e
    : $("#listNameInput").val());
}
function getListOfPerson(e = "", t = [], a = "") {
  let n = [];
  return (
    e
      ? n.push(e)
      : t.forEach((e) => {
          e = $("#person_" + e);
          e.find("input")[0].checked && n.push(e.attr("data-" + a));
        }),
    n
  );
}
function blurEmailName(e) {
  var [t, a] = e.split("@"),
    n = t?.toLowerCase(),
    t = t?.length;
  return 1 === t
    ? "*@" + a
    : 2 === t || ["hr", "info", "contact"].includes(n)
    ? e
    : n[0] + new Array(randomInteger(3, 7)).join("*") + n[t - 1] + "@" + a;
}
function isStringContainsCyrillic(e) {
  return /[\u0400-\u04FF]/.test(e);
}
function randomInteger(e, t) {
  return Math.floor(Math.random() * (t - e + 1)) + e;
}
async function updateErrorBadge(t = 1) {
  if (
    "255,0,0,255" === (await chrome.action.getBadgeBackgroundColor({})).join()
  ) {
    var a = await chrome.action.getBadgeText({});
    let e = Number(a) + t;
    e <= 0 && (e = ""), showErrorToIconBadge(String(e));
  } else showErrorToIconBadge(String(t <= 0 ? "" : t));
}
function showErrorToIconBadge(e = "") {
  chrome.action.setBadgeBackgroundColor({ color: "red" }),
    chrome.action.setBadgeText({ text: e }),
    chrome.action.setBadgeTextColor({ color: "white" });
}
!(function (e) {
  "use strict";
  function g(e, t) {
    var a = (65535 & e) + (65535 & t);
    return (((e >> 16) + (t >> 16) + (a >> 16)) << 16) | (65535 & a);
  }
  function o(e, t, a, n, s, i) {
    return g(((t = g(g(t, e), g(n, i))) << s) | (t >>> (32 - s)), a);
  }
  function u(e, t, a, n, s, i, r) {
    return o((t & a) | (~t & n), e, t, s, i, r);
  }
  function p(e, t, a, n, s, i, r) {
    return o((t & n) | (a & ~n), e, t, s, i, r);
  }
  function h(e, t, a, n, s, i, r) {
    return o(t ^ a ^ n, e, t, s, i, r);
  }
  function f(e, t, a, n, s, i, r) {
    return o(a ^ (t | ~n), e, t, s, i, r);
  }
  function r(e, t) {
    (e[t >> 5] |= 128 << t % 32), (e[14 + (((t + 64) >>> 9) << 4)] = t);
    for (
      var a,
        n,
        s,
        i,
        r = 1732584193,
        o = -271733879,
        l = -1732584194,
        d = 271733878,
        c = 0;
      c < e.length;
      c += 16
    )
      (r = u((a = r), (n = o), (s = l), (i = d), e[c], 7, -680876936)),
        (d = u(d, r, o, l, e[c + 1], 12, -389564586)),
        (l = u(l, d, r, o, e[c + 2], 17, 606105819)),
        (o = u(o, l, d, r, e[c + 3], 22, -1044525330)),
        (r = u(r, o, l, d, e[c + 4], 7, -176418897)),
        (d = u(d, r, o, l, e[c + 5], 12, 1200080426)),
        (l = u(l, d, r, o, e[c + 6], 17, -1473231341)),
        (o = u(o, l, d, r, e[c + 7], 22, -45705983)),
        (r = u(r, o, l, d, e[c + 8], 7, 1770035416)),
        (d = u(d, r, o, l, e[c + 9], 12, -1958414417)),
        (l = u(l, d, r, o, e[c + 10], 17, -42063)),
        (o = u(o, l, d, r, e[c + 11], 22, -1990404162)),
        (r = u(r, o, l, d, e[c + 12], 7, 1804603682)),
        (d = u(d, r, o, l, e[c + 13], 12, -40341101)),
        (l = u(l, d, r, o, e[c + 14], 17, -1502002290)),
        (r = p(
          r,
          (o = u(o, l, d, r, e[c + 15], 22, 1236535329)),
          l,
          d,
          e[c + 1],
          5,
          -165796510
        )),
        (d = p(d, r, o, l, e[c + 6], 9, -1069501632)),
        (l = p(l, d, r, o, e[c + 11], 14, 643717713)),
        (o = p(o, l, d, r, e[c], 20, -373897302)),
        (r = p(r, o, l, d, e[c + 5], 5, -701558691)),
        (d = p(d, r, o, l, e[c + 10], 9, 38016083)),
        (l = p(l, d, r, o, e[c + 15], 14, -660478335)),
        (o = p(o, l, d, r, e[c + 4], 20, -405537848)),
        (r = p(r, o, l, d, e[c + 9], 5, 568446438)),
        (d = p(d, r, o, l, e[c + 14], 9, -1019803690)),
        (l = p(l, d, r, o, e[c + 3], 14, -187363961)),
        (o = p(o, l, d, r, e[c + 8], 20, 1163531501)),
        (r = p(r, o, l, d, e[c + 13], 5, -1444681467)),
        (d = p(d, r, o, l, e[c + 2], 9, -51403784)),
        (l = p(l, d, r, o, e[c + 7], 14, 1735328473)),
        (r = h(
          r,
          (o = p(o, l, d, r, e[c + 12], 20, -1926607734)),
          l,
          d,
          e[c + 5],
          4,
          -378558
        )),
        (d = h(d, r, o, l, e[c + 8], 11, -2022574463)),
        (l = h(l, d, r, o, e[c + 11], 16, 1839030562)),
        (o = h(o, l, d, r, e[c + 14], 23, -35309556)),
        (r = h(r, o, l, d, e[c + 1], 4, -1530992060)),
        (d = h(d, r, o, l, e[c + 4], 11, 1272893353)),
        (l = h(l, d, r, o, e[c + 7], 16, -155497632)),
        (o = h(o, l, d, r, e[c + 10], 23, -1094730640)),
        (r = h(r, o, l, d, e[c + 13], 4, 681279174)),
        (d = h(d, r, o, l, e[c], 11, -358537222)),
        (l = h(l, d, r, o, e[c + 3], 16, -722521979)),
        (o = h(o, l, d, r, e[c + 6], 23, 76029189)),
        (r = h(r, o, l, d, e[c + 9], 4, -640364487)),
        (d = h(d, r, o, l, e[c + 12], 11, -421815835)),
        (l = h(l, d, r, o, e[c + 15], 16, 530742520)),
        (r = f(
          r,
          (o = h(o, l, d, r, e[c + 2], 23, -995338651)),
          l,
          d,
          e[c],
          6,
          -198630844
        )),
        (d = f(d, r, o, l, e[c + 7], 10, 1126891415)),
        (l = f(l, d, r, o, e[c + 14], 15, -1416354905)),
        (o = f(o, l, d, r, e[c + 5], 21, -57434055)),
        (r = f(r, o, l, d, e[c + 12], 6, 1700485571)),
        (d = f(d, r, o, l, e[c + 3], 10, -1894986606)),
        (l = f(l, d, r, o, e[c + 10], 15, -1051523)),
        (o = f(o, l, d, r, e[c + 1], 21, -2054922799)),
        (r = f(r, o, l, d, e[c + 8], 6, 1873313359)),
        (d = f(d, r, o, l, e[c + 15], 10, -30611744)),
        (l = f(l, d, r, o, e[c + 6], 15, -1560198380)),
        (o = f(o, l, d, r, e[c + 13], 21, 1309151649)),
        (r = f(r, o, l, d, e[c + 4], 6, -145523070)),
        (d = f(d, r, o, l, e[c + 11], 10, -1120210379)),
        (l = f(l, d, r, o, e[c + 2], 15, 718787259)),
        (o = f(o, l, d, r, e[c + 9], 21, -343485551)),
        (r = g(r, a)),
        (o = g(o, n)),
        (l = g(l, s)),
        (d = g(d, i));
    return [r, o, l, d];
  }
  function l(e) {
    for (var t = "", a = 0; a < 32 * e.length; a += 8)
      t += String.fromCharCode((e[a >> 5] >>> a % 32) & 255);
    return t;
  }
  function d(e) {
    var t,
      a = [];
    for (a[(e.length >> 2) - 1] = void 0, t = 0; t < a.length; t += 1) a[t] = 0;
    for (t = 0; t < 8 * e.length; t += 8)
      a[t >> 5] |= (255 & e.charCodeAt(t / 8)) << t % 32;
    return a;
  }
  function n(e) {
    for (var t, a = "0123456789abcdef", n = "", s = 0; s < e.length; s += 1)
      (t = e.charCodeAt(s)), (n += a.charAt((t >>> 4) & 15) + a.charAt(15 & t));
    return n;
  }
  function c(e) {
    return unescape(encodeURIComponent(e));
  }
  function s(e) {
    return l(r(d((e = c(e))), 8 * e.length));
  }
  function i(e, t) {
    var a,
      e = c(e),
      t = c(t),
      n = d(e),
      s = [],
      i = [];
    for (
      s[15] = i[15] = void 0, 16 < n.length && (n = r(n, 8 * e.length)), a = 0;
      a < 16;
      a += 1
    )
      (s[a] = 909522486 ^ n[a]), (i[a] = 1549556828 ^ n[a]);
    return (e = r(s.concat(d(t)), 512 + 8 * t.length)), l(r(i.concat(e), 640));
  }
  function t(e, t, a) {
    return t ? (a ? i(t, e) : n(i(t, e))) : a ? s(e) : n(s(e));
  }
  "function" == typeof define && define.amd
    ? define(function () {
        return t;
      })
    : (e.md5 = t);
})(this);

//API调用
const API_HOST = APP_HOST + "/extension/api",
  USER_BALANCE = "/user/balance",
  CONTACTS_BY_DOMAIN = "/contacts/get-by-domain",
  PEOPLE_CREATE = "/peoples/create",
  PEOPLE_CREATE_FROM_EMAIL = "/peoples/create/from-email",
  PEOPLE_CONTACTS = "/peoples/contacts",
  PEOPLE_ADD_TO_LIST = "/peoples/add-to-list",
  PEOPLE_SEARCH_CONTACTS = "/peoples/contacts-by-ids",
  COMPANIES_CREATE = "/companies/create",
  COMPANIES_CREATE_BY_URLS = "/companies/create-by-urls",
  COMPANIES_INFO = "/companies/info",
  COMPANIES_PROSPECTS = "/companies/prospects",
  LISTS_BY_USER = "/lists/get-by-user-id",
  LISTS_BY_PROSPECTS = "/lists/get-by-peoples-ids",
  LISTS_BY_EMAILS = "/lists/get-by-emails",
  NEWS_GET = "/news/get-last",
  DEFAULT_HEADERS = {
    "Content-Language": getUILanguage(),
    "Ext-Version": chrome.runtime.getManifest().version,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
function post(a, t) {
  return fetch(a, {
    method: "POST",
    body: JSON.stringify(t),
    headers: DEFAULT_HEADERS,
  });
}
function put(a, t) {
  return fetch(a, {
    method: "PUT",
    body: JSON.stringify(t),
    headers: DEFAULT_HEADERS,
  });
}
function get(a) {
  return fetch(a, { method: "GET", headers: DEFAULT_HEADERS });
}
async function apiGetEmailsByDomain(a) {
  a = await (
    await get(
      API_HOST + CONTACTS_BY_DOMAIN + "?" + new URLSearchParams(a).toString()
    )
  ).json();
  return a.data || a;
}
async function apiCreateCompany(a) {
  a = await (await post(API_HOST + COMPANIES_CREATE, a)).json();
  return a.data || a;
}
async function apiCreateCompaniesByUrls(a) {
  a = await (await post(API_HOST + COMPANIES_CREATE_BY_URLS, a)).json();
  return a.data || a;
}
async function apiGetCompanyInfo(a) {
  a = await (
    await get(
      API_HOST + COMPANIES_INFO + "?" + new URLSearchParams(a).toString()
    )
  ).json();
  return a.data || a;
}
async function apiGetProspectsByCompany(a) {
  a = await (
    await get(
      API_HOST + COMPANIES_PROSPECTS + "?" + new URLSearchParams(a).toString()
    )
  ).json();
  return a.data || a;
}
async function apiGetListsByUserId(a) {
  a = await (
    await get(
      API_HOST + LISTS_BY_USER + "?" + new URLSearchParams(a).toString()
    )
  ).json();
  return a.data || a;
}
async function apiGetListsByPeoplesIds(a) {
  const e = new URL(API_HOST + LISTS_BY_PROSPECTS);
  a.forEach((a, t) => {
    (a.source_id || a.source_id_2) &&
      (e.searchParams.append(`in${t}[]`, a.source_id),
      e.searchParams.append(`in${t}[]`, a.source_id_2));
  });
  a = await (await get(e)).json();
  return a.data || a;
}
async function apiGetListsByEmails(a) {
  const t = new URL(API_HOST + LISTS_BY_EMAILS);
  a.forEach((a) => {
    t.searchParams.append("emails[]", a);
  });
  a = await (await get(t)).json();
  return a.data || a;
}
async function apiGetLastNews(a) {
  a = await (
    await get(API_HOST + NEWS_GET + "?" + new URLSearchParams(a).toString())
  ).json();
  return a.data || a;
}
async function apiPeopleCreate(a) {
  a = await (await post(API_HOST + PEOPLE_CREATE, a)).json();
  return a.data || a;
}
async function apiPeopleCreateFromEmail(a) {
  a = await (await post(API_HOST + PEOPLE_CREATE_FROM_EMAIL, a)).json();
  return a.data || a;
}
async function apiGetProspectEmails(a) {
  a = await (
    await get(
      API_HOST + PEOPLE_CONTACTS + "?" + new URLSearchParams(a).toString()
    )
  ).json();
  return a.data || a;
}
async function apiPeopleAddToList(a) {
  a = await (await put(API_HOST + PEOPLE_ADD_TO_LIST, a)).json();
  return a.data || a;
}
async function apiGetSearchContacts(a) {
  a = await (
    await get(
      API_HOST +
        PEOPLE_SEARCH_CONTACTS +
        "?" +
        new URLSearchParams(a).toString()
    )
  ).json();
  return a.data || a;
}
async function apiGetUserBalance() {
  var a = await (await get(API_HOST + USER_BALANCE)).json();
  return a.data || a;
}

//校验登录
const mainHost = "https://app.snov.io",
  mHost = "app.snov.io";
var bStartedCheckAuth = !1;
function parseCheckLogin(e, t) {
  function o(e) {
    chrome.cookies.set(
      {
        name: "token",
        url: mainHost,
        value: e,
        expirationDate: new Date() / 1e3 + 1209600,
        httpOnly: !0,
        secure: !0,
        sameSite: "no_restriction",
      },
      function (e) {
        bStartedCheckAuth = !1;
      }
    );
  }
  var n = JSON.parse(e);
  n && n.result
    ? (n.name && n.name && (localStorage.userName = n.name),
      n.token
        ? chrome.cookies.set(
            {
              name: "token",
              url: mainHost,
              value: n.token,
              expirationDate: new Date() / 1e3 + 1209600,
              httpOnly: !0,
              secure: !0,
              sameSite: "no_restriction",
            },
            function (e) {
              chrome.cookies.get(
                { url: mainHost, name: "token" },
                function (e) {
                  e && e.value;
                }
              ),
                e
                  ? (bStartedCheckAuth = !1)
                  : chrome.cookies.set(
                      {
                        name: "token",
                        url: mainHost,
                        value: n.token,
                        expirationDate: new Date() / 1e3 + 1209600,
                        httpOnly: !0,
                        secure: !0,
                        sameSite: "no_restriction",
                      },
                      function (e) {
                        e
                          ? (bStartedCheckAuth = !1)
                          : setTimeout(o, 1e3, n.token);
                      }
                    );
            }
          )
        : (bStartedCheckAuth = !1),
      n.fingerprint &&
        chrome.cookies.set({
          name: "fingerprint",
          url: mainHost,
          value: n.fingerprint,
          expirationDate: new Date() / 1e3 + 1209600,
          httpOnly: !0,
          secure: !0,
        }),
      n.name && t && t())
    : (chrome.cookies.remove({ name: "token", url: mainHost }),
      chrome.cookies.remove({ name: "selector", url: mainHost }),
      t && t());
}
function checkLogin(e, t, o) {
  var n = "",
    a =
      ("" !== e && "" !== t && (n = "selector=" + e + "&token=" + t),
      new XMLHttpRequest());
  a.open("POST", mainHost + "/api/checkAuth", !0),
    (a.withCredentials = !0),
    a.overrideMimeType("text/xml"),
    a.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"),
    (a.onreadystatechange = function () {
      4 === a.readyState &&
        (200 === a.status
          ? parseCheckLogin(a.responseText, o)
          : (localStorage[new Date().toString() + "_checkAuthPost_ERROR"] =
              a.statusText));
    }),
    a.send(n);
}
function checkAuthenticationUpdate(t) {
  var o = (localStorage.userName = ""),
    n = "";
  chrome.cookies &&
    !bStartedCheckAuth &&
    ((bStartedCheckAuth = !0),
    chrome.cookies.get({ url: mainHost, name: "selector" }, function (e) {
      e
        ? ((o = e.value),
          chrome.cookies.get({ url: mainHost, name: "token" }, function (e) {
            e ? (n = e.value) : checkLogin(o, n, t),
              o && n && checkLogin(o, n, t);
          }))
        : checkLogin(o, n, t);
    }));
}
function checkAuthentication() {
  localStorage.host = mainHost;
  var t = (localStorage.userName = ""),
    o = "";
  chrome.cookies &&
    !bStartedCheckAuth &&
    ((bStartedCheckAuth = !0),
    chrome.cookies.get({ url: mainHost, name: "selector" }, function (e) {
      e
        ? ((t = e.value),
          chrome.cookies.get({ url: mainHost, name: "token" }, function (e) {
            e && (o = e.value), checkLogin(t, o);
          }))
        : checkLogin(t, o);
    }));
}
chrome.runtime &&
  (chrome.runtime.onStartup.addListener(function () {
    checkAuthentication();
  }),
  chrome.runtime.onInstalled.addListener(function () {
    checkAuthentication();
  }));

//动画效果添加
function showStars() {
  if ($("#stars").hasClass("hidden")) {
    let e = 0;
    localStorage.impressions && (e = localStorage.impressions),
      e++,
      (25 < (localStorage.impressions = e) && e < 31) ||
      50 == e ||
      100 == e ||
      200 == e ||
      500 == e ||
      1e3 == e
        ? null == localStorage.needShowRate && (localStorage.needShowRate = 1)
        : 1 == localStorage.needShowRate &&
          localStorage.removeItem("needShowRate"),
      localStorage.needShowRate &&
        1 == localStorage.needShowRate &&
        (($contacts = $(".contacts-table")) &&
          $contacts.css("max-height", "300px"),
        addStars(),
        show(document.getElementById("allStars")),
        $(".stars").on("change", ".star input[name='star']", function () {
          var e = $(this).val();
          +(localStorage.star = e) < 4
            ? (show(document.getElementById("badEval")),
              hide(document.getElementById("allStars")),
              (localStorage.needShowRate = 0),
              setTimeout(() => {
                $("#stars").slideUp(300);
              }, 5e3))
            : (hide(document.getElementById("allStars")),
              (localStorage.needShowRate = 0),
              chrome.tabs.create({
                url: "https://chrome.google.com/webstore/detail/snovio/einnffiilpmgldkapbikhkeicohlaapj/reviews",
              }));
        }));
  }
}
function addStars() {
  var e =
    `
        <div class="pfe-alert pfe-alert--primary">
        <div id="allStars" hidden=true>
        <div class="pfe-alert__title pfe-alert__title--center">` +
    getMessage("rateUs_title", "How much are you enjoying Email Finder?") +
    `</div>
        <div class="stars">
            <label class="star star-1">
                <input type="radio" name="star" value="1"/>
            </label>            
            <label class="star star-2">
                <input type="radio" name="star" value="2"/>
            </label>            
            <label class="star star-3">
                <input type="radio" name="star" value="3"/>
            </label>            
            <label class="star star-4">
                <input type="radio" name="star" value="4"/>
            </label>            
            <label class="star star-5">
                <input type="radio" name="star" value="5"/>
            </label>            
            <span></span>
        </div></div>
        <div id="badEval" class="pfe-alert__title pfe-alert__title--center mt-0" hidden="true">` +
    getMessage(
      "rateUs_badEval",
      'Thanks for your feedback! You can help us improve by sending your suggestions to <a href="mailto:help@snov.io">help@snov.io</a>.'
    ) +
    `</div>
        </div>`;
  $("#stars").append(e), $("#stars").removeClass("hidden");
}
function reRenderCountOfSelectedItems(e, t) {
  var a = e.find(".js-list-item input:checked").length,
    e = e.find(".js-list-item input").length;
  (e !== a || !e) && a
    ? (t.text(
        getMessage("selected_of", "select")
          .replace("{selectedCount}", a)
          .replace("{totalSub}", e)
      ),
      t.siblings("span").attr("id", "not-all"))
    : showSelectAllItems(t, e);
}
function changeSelectAllCheckStatus(e, t) {
  var a = e.find(".js-list-item input:checked").length,
    e = e.find(".js-list-item input").length,
    e = e === a && !!e;
  a || t.prevAll("input[type='checkbox']").prop("checked", !1),
    e && t.prevAll("input[type='checkbox']").prop("checked", !0);
}
function updateItemCheckbox(a = !1) {
  return (e, t) => {
    $(t).find("input").prop("checked", a), $(t).find("input").trigger("change");
  };
}
function updateTwitterItemCheckbox(a = !1) {
  return (e, t) => {
    "error" === $(".main-body").data("status") && a
      ? $(t).addClass("no-credits")
      : $(t).removeClass("no-credits"),
      $(t).find("input").prop("checked", a),
      $(t).find("input").trigger("change");
  };
}
function showSelectAllItems(e = {}, t = 0) {
  e.text(getMessage("select_all", "Select") + " (" + t + ")"),
    e.siblings("span").removeAttr("id");
}
function checkIfValidNewListName(e) {
  let t = $("#listNameInput");
  if (t.parent().hasClass("hidden")) return !0;
  let a = t.val();
  return (
    !(
      !(a = a.trim()) ||
      !/^[\u0080-\uFFFF\u2E80-\u9FFFа-яА-ЯёЁіІїЇґҐáéíóúàâêôãõüçÁÉÍÓÚÀÂÊÔÃÕÜÇ%$*#!+-=_.,/|()\w\d\s]*$/g.test(
        a
      )
    ) ||
    (e && $(window).trigger("contactsSavingReset", [e]),
    $(".js-add-new-list-container").addClass("has-error"),
    setTimeout(() => {
      $(".js-add-new-list-container").removeClass("has-error");
    }, 1e3),
    setTimeout(() => {
      t.focus().select();
    }, 100),
    !1)
  );
}
function localizeHtmlCommon() {
  $("[data-translate]").each(function () {
    var e = $(this).data("translate");
    $(this).html(getMessage(e, DefaultValuesLang[e].message));
  }),
    $("[data-translate-href]").each(function () {
      var e = $(this).attr("data-translate-href");
      $(this).attr("href", getMessage(e, DefaultValuesLang[e].message));
    }),
    $("[data-translate-title]").each(function () {
      var e = $(this).attr("data-translate-title");
      $(this).attr("title", getMessage(e, DefaultValuesLang[e].message));
    }),
    $("[data-translate-load-text]").each(function () {
      var e = $(this).attr("data-translate-load-text");
      $(this).attr(
        "data-loading-text",
        getMessage(e, DefaultValuesLang[e].message) + "..."
      );
    }),
    "" === $(".pfe-select__selected").text() &&
      $(".pfe-select__selected").text(
        getMessage("createSelectList", "Create or select list")
      );
}
function showErrorGlobal(e, t) {
  $("#errorMessage").html(`<div>
        <h3>${e}</h3>
        <div class="pfe-alert__text">${t}</div></div>`),
    $("#error").removeClass("hidden");
}
function _showListLink(e) {
  var t = e.next("a");
  let a = e.closest("section").find("select").val();
  var s = $("#listNameInput").val(),
    n =
      0 !== $(".js-add-new-list-container").length &&
      !$(".js-add-new-list-container").hasClass("hidden"),
    i = t.data("section"),
    l = "prospects" === i ? userLists_prospects : userLists_companies,
    r = checkIfNewUserListDuplicate(l, s);
  a = a || e.closest("section").find('input[name="usersList"]:checked').val();
  let o = getMainHost() + "/" + i;
  n || (o += "/list/" + a),
    r && (o += "/list/" + getDuplicateUserListID(l, s)),
    e.addClass("hidden"),
    t.attr("data-enabled", !0),
    t.attr("href", o).removeClass("hidden"),
    $(".js-toggle-new-list").addClass("pfe-select__static--disabled");
}
function getNewUserListText() {
  var e = $("#selectedItemUsersPeopleList").text(),
    t = $("#selectedItemUsersCompanyList").text();
  return e || t || "";
}
function refreshItemListLinks(e = "") {
  var t,
    a,
    e = $("#person_" + e),
    s = e.find(".js-contact-saved-list a"),
    n = s.length,
    i = !$(".js-add-new-list-container").hasClass("hidden"),
    l = e.find(".js-contact-saved-list");
  let r = "";
  i &&
    ((a = $("#listNameInput").val()),
    (t = checkIfNewUserListDuplicate(userLists_prospects, a)),
    (r += t
      ? `<a href="${APP_HOST}/prospects/list/${getDuplicateUserListID(
          userLists_prospects,
          a
        )}" target="_blank">${a}</a>`
      : `<a href="${APP_HOST}/prospects/" target="_blank">${a}</a>`)),
    i ||
      ((a = (t = $userPeopleSelect.find(
        'input[name="usersList"]:checked'
      )).data("value")),
      (i = t.data("list-text")),
      (r += `<a href="${APP_HOST}/prospects/list/${a}" target="_blank">${i}</a>`)),
    n &&
      ((a = (t = e.find(".js-contact-saved-list .count")).length
        ? parseInt(t.text())
        : 0),
      (i = s.text()),
      (i += a ? ", " + t.attr("title") : ""),
      (r += `<span class="count" title="${i}">+${++a}</span>`)),
    l.html(r);
}
function _keyupEvent(e) {
  var t, a;
  13 === e.keyCode &&
    (e.preventDefault(),
    e.stopImmediatePropagation(),
    (e = { count: 0 }),
    (t = $domainEmails.closest("section").find(".js-list-item")),
    (a = $("#prospectsContainer").closest("section").find(".js-list-item")),
    t.each(getSelectedCount(e)),
    a.each(getSelectedCount(e)),
    0 < e.count) &&
    clickSendBtn();
}
function getSelectedCount(e = {}) {
  return function () {
    !0 === $(this).find("input").prop("checked") && (e.count += 1);
  };
}
function clickSendBtn() {
  $("#btnSendDomains").length
    ? $("#btnSendDomains").trigger("click")
    : $domainEmails.hasClass("hidden")
    ? $("#prospectsContainer").hasClass("hidden") ||
      $btnSendProspectList.trigger("click")
    : $btnSendEmailList.trigger("click");
}
function checkValidUserListName(e = {}) {
  return e.preventDefault(), !!checkIfValidNewListName(e);
}
function sendMessageSearchSaveSelected() {
  chrome.runtime.sendMessage({
    type: "ga",
    action: "domainSearchSaveSelected",
  });
}
function initResizeObserver(
  t = [],
  e = {},
  s = { viewHeight: 560, otherElementsHeight: 0 }
) {
  new ResizeObserver(
    debounce(function (e) {
      if (e || e[0]) {
        e = e[0].contentRect.height;
        const a = s.viewHeight - s.otherElementsHeight - e;
        t.forEach((e) => {
          var t = e.find(".view-all-results-link");
          e.css("max-height", a + "px"),
            a < 150 && t.length
              ? (t.addClass("view-all-results-link-static"),
                e.removeClass("pb-60"))
              : 150 <= a &&
                t.length &&
                $(".view-all-results-link-static").length &&
                (e.addClass("pb-60"),
                t.removeClass("view-all-results-link-static"));
        });
      }
    }, 50)
  ).observe(e);
}
function showNewVersionBanner() {
  var e = getMessage("newVersion_updateUrl", NEW_VERSION_UPDATE_URL),
    t = "";
  (t += `<div class="main-body mt-5">
        <div class="pfe-alert pfe-alert--secondary">
            <div class="pfe-alert__title">
                ${getMessage(
                  "update_title",
                  "This extension version is obsolete"
                )} 
                <img src="../img/svg/heart.svg" alt="" class="icon">
            </div>
            <div class="pfe-alert__text">
                ${getMessage(
                  "update_text",
                  "Please update Email Finder extension to continue collecting prospects."
                )}
            </div>
            <a href="${e}" target="_blank" class="pfe-button pfe-button--with-icon-start pfe-button--primary">
                <img src="../img/svg/update.svg" alt="" class="icon">
                ${getMessage("update_button", "Update now")}         
            </a>
        </div>
    </div>`),
    $("#searchBlock").length && $("#searchBlock").remove(),
    $("#contentPage").html(t),
    $("#contentPage").removeClass("hidden"),
    $("#companyInfoBody").hide(),
    $("#LinkedInSearchPeople").hide(),
    $("#personInfoBody").hide(),
    $(".main-footer").hide();
}
function showMessageForFreeUser() {
  var e = APP_HOST + "/pricing-plans",
    t = "";
  (t += `<div class="free-plan">
        <div class="pfe-alert pfe-alert--secondary pfe-alert--flex-center"> 
            <div class="pfe-alert__text">
                ${getMessage(
                  "messageForFreeUser",
                  "Unlock bulk search and collect thousands more leads!"
                )}
            </div>
            <a href="${e}" target="_blank" class="pfe-button pfe-button--with-icon-start pfe-button--primary">
                <img src="../img/svg/star.svg" alt="" class="icon">
                ${getMessage("goPremium", "Go premium")}         
            </a>
        </div>
    </div>`),
    $("#top").append(t);
}
$(window).on("contactsSaving", function (e, t) {
  $(t.target).button("loading");
}),
  $(window).on("contactsSaved contactsSavingReset", function (e, t) {
    let a = $(t.target);
    setTimeout(function () {
      a.button("reset").button("toggle"),
        "contactsSaved" == e.type && _showListLink(a);
    }, 500);
  });

//加载更新用户数据
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

//选择列表视图
async function showTab() {
  var e = $(this).data("tab");
  "prospects" !== e ||
    (handleSectionElements(
      $("#prospectsContainer"),
      $domainEmails,
      $("#goToListEmail"),
      {
        $openListLink: $("#goToListProspect"),
        btnSend: BTN_SEND_PROSPECT_LIST,
        btnSendDisabled: BTN_SEND_EMAIL_LIST,
      }
    ),
    Array.isArray(companyData.prospects)) ||
    (await getProspectsByCompany(companyID)),
    "emails" === e &&
      handleSectionElements(
        $domainEmails,
        $("#prospectsContainer"),
        $("#goToListProspect"),
        {
          $openListLink: $("#goToListEmail"),
          btnSend: BTN_SEND_EMAIL_LIST,
          btnSendDisabled: BTN_SEND_PROSPECT_LIST,
        }
      );
}
function handleSectionElements(e = {}, t = {}, n = {}, a = {}) {
  e.removeClass("hidden"),
    t.addClass("hidden"),
    lowBalance || showTabBtnSendList(a.btnSend, a.btnSendDisabled),
    n.addClass("hidden"),
    a.$openListLink.attr("data-enabled")
      ? ($(".js-toggle-new-list").addClass("pfe-select__static--disabled"),
        a.$openListLink.removeClass("hidden"),
        disableButton(a.btnSend))
      : $(".js-toggle-new-list").removeClass("pfe-select__static--disabled");
}
function showTabBtnSendList(e = "", t = "") {
  disableButton(t), enableButton(e);
}
function disableButton(e = "") {
  $("#" + e).addClass("hidden");
}
function enableButton(e = "") {
  $("#" + e).removeClass("hidden");
}
function showEmptyHostError() {
  $domainEmails.addClass("hidden"),
    $searchBlock.addClass("hidden"),
    $(".footer-body").addClass("hidden"),
    $(".alert-status--no_login").hide(),
    $(document.body).append($("#currentHostEmptyTemplate").html());
}
function showNotFoundMessage() {
  isHiddenDomain
    ? showHiddenDomainInformation(
        $domainEmails,
        $("#hiddenDomainEmails"),
        $btnSendEmailList
      )
    : ($searchBlock.addClass("hidden"),
      $domainEmails.html($("#notFoundTemplate").html()),
      $domainEmails.removeClass("hidden"),
      $btnSendEmailList.attr("disabled", "true"));
}
function showHiddenDomainInformation(e, t, n) {
  $searchBlock.addClass("hidden"),
    e.html(t.html()),
    e.removeClass("hidden"),
    n.addClass("pfe-button--thirdy"),
    n.text(getMessage("gotIt")),
    n.off(),
    n.on("click", () => window.close());
}
function hideProspectsContainer() {
  isHiddenDomain
    ? showHiddenDomainInformation(
        $("#prospectsContainer"),
        $("#hiddenDomainProspects"),
        $("#btnSendProspectList")
      )
    : ($searchBlock.addClass("hidden"),
      $("#prospectsContainer").html($("#notFoundProspectsTemplate").html()),
      $btnSendProspectList.attr("disabled", "true"));
}
function getEmailsErrorProcessing(e) {
  $contentPage.removeClass("hidden"), $searchBlock.addClass("hidden");
}
function showUpgradePlanError(e, t, n) {
  var a =
    (a =
      (a =
        (a = '<div class="pfe-alert pfe-alert--secondary">') +
        (e ? `<h3>${e}</h3>` : "") +
        (t ? `<p className="pfe-alert__text">${t}</p>` : "")) +
      `<a href="${APP_HOST}/pricing-plans" class="pfe-button pfe-button--primary" target="_blank">`) +
    `<img src="../img/svg/star.svg" alt="" class="icon icon--up">${getMessage(
      "upgradePlan",
      "Upgrade my plan"
    )}</a></div>`;
  (n ? $(n) : ($("#prospectsContainer").html(a), $("#domainEmails"))).html(a);
}
function updateCompanyTemplate(e, t) {
  if ("" !== e.name) {
    var n = $("#companyInfoBody");
    n.find(".js-contact-name").append(e.name);
    for (const a of e.socials)
      "facebook" === a.source &&
        $(".js-contact-link-fb").attr("href", a.link).removeClass("hidden"),
        "linkedIn" === a.source &&
          $(".js-contact-link-li").attr("href", a.link).removeClass("hidden"),
        "twitter" === a.source &&
          $(".js-contact-link-tw").attr("href", a.link).removeClass("hidden");
    e.img && n.find(".js-company-logo").attr("src", e.img),
      e.industry &&
        n.find(".js-company-industry").append(e.industry).removeClass("hidden"),
      e.address &&
        n.find(".js-contact-location").append(e.address).removeClass("hidden"),
      e.size &&
        n
          .find(".js-contact-size")
          .append(e.size + " " + getMessage("employees", "employees"))
          .removeClass("hidden"),
      e.founded &&
        n.find(".js-contact-founded").append(e.founded).removeClass("hidden"),
      n.removeClass("hidden"),
      t &&
        $("#company-name")
          .addClass("with-link")
          .click(
            () => (
              chrome.runtime.sendMessage({
                type: "ga",
                action: "domainSearchCompanyNameClick",
              }),
              chrome.tabs.create({
                url: getMainHost() + "/plugin/history-best-company/" + t,
              }),
              event.preventDefault(),
              !1
            )
          );
  }
}
function renderItemTemplate(a = {}, e = "", t = [], s = {}) {
  if (t && 0 < t.length) {
    a.empty();
    let n = $("#" + e).html();
    t.forEach((e) => {
      var t = $(n);
      s.appendElementsCallback(t, e),
        t.attr("data-" + s.tabName, e),
        t.find(".add-to-list-" + s.tabName).attr("data-" + s.tabName, e),
        t.on("change", () =>
          checkSelected(a, s.btnSendName, s.btnSelectAllName)
        ),
        a.append(t);
    });
  }
}
function appendEmailElements(e = {}, t = "") {
  var n = Object.entries(emailList)
    .filter(([, e]) => e.email === t)
    .map(([e]) => e)
    .join("");
  e.attr("id", "person_" + n), e.find(".js-contact-email").text(t);
}
function appendProspectElements(e = {}, t = "") {
  var n = companyData.prospects.find((e) => e.id === t),
    a =
      n &&
      n.socials &&
      n.socials.find(
        (e) =>
          "linkedin" === e.type || "twitter" === e.type || "facebook" === e.type
      );
  e.attr("id", "person_" + n.id),
    appendTextAndTitle(e.find(".prospect-info__name"), n.name),
    n.position
      ? appendTextAndTitle(e.find(".prospect-info__profession"), n.position)
      : e
          .find(".prospect-info__profession")
          .css({ width: 0, "margin-right": 0 }),
    isAuth && e.find(".add-to-list-prospect").removeClass("hidden"),
    isAuth && a
      ? e
          .find(".js-contact-link-" + a.type)
          .attr("href", a.link)
          .removeClass("hidden")
      : !isAuth &&
        a &&
        (e.find(".js-contact-link-" + a.type).removeClass("hidden"),
        e.find(".js-contact-link-" + a.type).css({ "pointer-events": "none" })),
    n.emails.length && e.find(".prospect-info__email").text(n.emails[0].email);
}
function appendTextAndTitle(e = {}, t = "") {
  e.text(t), e.attr("title", t);
}
function addButtons(e = "", t = 0, n = 0, a) {
  2 <= t &&
    !$("#" + e).find(".pfe-checkbox--select-all").length &&
    addSelectAll("#" + e, {
      containerElement: $("#" + e),
      btnID: a.btnSendName,
      selectID: a.btnSelectAllName,
    }),
    10 <= n &&
      !$("#" + e).find(".view-all-results-link").length &&
      _addShowAllBtn("#" + e, n, a.showAllLink);
}
function addSelectAll(e, a) {
  var t = $("#selectAllTemplate"),
    t =
      (t.find("[data-translate='selectAllBtn']").attr("id", a.selectID),
      t.html());
  $(e).prepend(t),
    $(e).on("change", '[name="selectAll"]', function () {
      var e = $(this),
        t = e.closest("section").find(".js-list-item"),
        n = e.is(":checked");
      t.find("input:checked").length === t.length
        ? t.each(updateItemCheckbox(n))
        : (t.each(updateItemCheckbox(!0)),
          e.prop("checked", !0),
          e.trigger("change")),
        checkSelected(a.containerElement, a.btnID, a.selectID);
    });
}
function _addShowAllBtn(e, t, n) {
  var a = $($("#showAllBtnTemplate").html());
  a.attr("href", n), $(e).addClass("pb-60"), $(e).append(a);
  setQuantity($(e).find("a"), t, {
    one: "result",
    many: "results",
    five: "results5",
  });
}
function _showCompleteSearchBtn(e) {
  $("#completeSearchTemplate").removeClass("hidden"),
    $("#btn-complete-search").attr(
      "href",
      getMainHost() + "/plugin/history/" + e
    ),
    $("#btn-complete-search").click(() => {
      chrome.runtime.sendMessage({
        type: "ga",
        action: "domainSearchCompleteSearch",
      });
    });
}
function checkSelected(e = {}, t = "", n = "") {
  var a, s;
  lowBalance ||
    ((s = 0),
    (s = (a = e.closest("section").find(".js-list-item")).find(
      "input:checked"
    ).length) < a.length &&
      $("#" + n)
        .prevAll("input[type='checkbox']")
        .prop("checked", !1),
    (a = 0 === s),
    (s = $("#" + t)).attr("disabled", a),
    a ? s.addClass("disabled") : s.removeClass("disabled"),
    reRenderCountOfSelectedItems(e.closest("section"), $("#" + n)),
    changeSelectAllCheckStatus(e.closest("section"), $("#" + n)));
}
function setQuantity(e, t, n) {
  $(e)
    .find(".quantity")
    .append(`&nbsp;${t.toLocaleString(chrome.i18n.getUILanguage())}&nbsp;`),
    $(e)
      .find(".prop-name")
      .text(
        getMessage(
          "uk" !== chrome.i18n.getUILanguage().split("-")[0]
            ? n.many
            : getNoun(t, n)
        )
      );
}
function getNoun(e, t) {
  e = Math.abs(e);
  return 5 <= (e %= 100) && e <= 20
    ? t.five
    : 1 == (e %= 10)
    ? t.one
    : 2 <= e && e <= 4
    ? t.many
    : t.five;
}
$("#only_prospects").on("click", showTab),
  $("#only_emails").on("click", showTab);

//启动文件
const maxCountAttemptsGetContactProspect = 10;
let emailList = {},
  prospectList = [],
  selectedEmails = [],
  maDefaultListId = 0,
  currentHost = "",
  emailsOnPage = [],
  companyID = "",
  companyData = {},
  selectedProspectIDs = [],
  totalEmails = 0,
  sentSinglEmeilsCounter = 0,
  sentSingleProspectsCounter = 0,
  countAttemptsGetContactProspect = 0,
  isHiddenDomain = !1,
  search_id = 0,
  search_auth,
  //域名邮箱信息展示区
  $domainEmails = $("#domainEmails"),
  //潜在客户信息展示区
  $prospectsContainer = $("#prospectsContainer"),
  // 用户选择可存储地址列表
  $userPeopleSelect = $("#userPeopleSelect"),
  // 用户当前爬取企业信息展示区
  $select,
  $companyInfoBody = $("#companyInfoBody"),
  // 切换潜在客户和域名邮箱tab区
  $contentPage = $("#contentPage"),
  // "搜索中"展示效果区域
  $searchBlock = $("#searchBlock");

const SELECT_ALL_EMAILS = "selectAllEmails",
  SELECT_ALL_PROSPECTS = "selectAllProspects",
  BTN_SEND_EMAIL_LIST = "btnSendEmailList",
  BTN_SEND_PROSPECT_LIST = "btnSendProspectList",
  SEARCH_TEXT_LOADER = "Searching...";
// 保存域名邮箱按钮
let $btnSendEmailList = $("#" + BTN_SEND_EMAIL_LIST),
  // 保存潜在客户按钮
  $btnSendProspectList = $("#" + BTN_SEND_PROSPECT_LIST);
function initPopupTabsQuery() {
  chrome.tabs.query({ active: !0, currentWindow: !0 }, (e) => {
    setEventsOnFooterDropdown(), addHandlerToUserListsLoaded();
    const s = e[0];
    currentHost = tldjs.getDomain(s.url);
    let a = document.createElement("a");
    (a.href = s.url),
      currentHost
        ? "" !== (e = checkRedirectForSpecialSites(s.url))
          ? (window.location.href = e)
          : chrome.tabs.sendMessage(
              s.id,
              { method: "getInnerHTML" },
              async (e) => {
                let t = [];
                e && (t = searchEmailsO(e.data, currentHost)),
                  await loadUserLists("people"),
                  await getEmailsByDomain(s.url, t),
                  await getCompanyByDomain(a.protocol + "//" + a.host);
                e =
                  ($(".pfe__radio-select-panel")[0]?.offsetHeight || 0) +
                  ($(".main-footer")[0]?.offsetHeight || 0);
                initResizeObserver(
                  [$("#domainEmails"), $("#prospectsContainer")],
                  $("#top")[0],
                  { viewHeight: 560, otherElementsHeight: e }
                );
              }
            )
        : showEmptyHostError();
  });
}
function checkRedirectForSpecialSites(e) {
  var t = document.createElement("a"),
    e = ((t.href = e), t.hostname);
  return e.includes("linkedin.com")
    ? "../html/linkedin.html"
    : e.includes("facebook.com")
    ? "../html/facebook.html"
    : e.includes("twitter.com")
    ? -1 !== t.pathname.indexOf("search")
      ? "../html/TwitterSearch.html"
      : -1 !== t.href.search(/twitter.com\/.+/i)
      ? "../html/Twitter.html"
      : ""
    : e.includes("yelp.com")
    ? t.pathname.includes("/biz/")
      ? "../html/YelpCompany.html"
      : ""
    : e.includes("google.") &&
      t.pathname.includes("/search") &&
      "googleSearch" !== localStorage.getItem(LS_referrer)
    ? "../html/GoogleSearch.html"
    : (localStorage.getItem(LS_referrer) &&
        localStorage.removeItem(LS_referrer),
      "");
}
async function getEmailsByDomain(e, t = []) {
  e = await apiGetEmailsByDomain({ link: e });
  0 === e.result
    ? getEmailsErrorProcessing(e)
    : ((!1 !== e.auth && localStorage.userName) || authProcessing(e),
      (e && e.list) || 0 !== t.length
        ? e.disabled
          ? ((isHiddenDomain = !0), showNotFoundMessage())
          : ((search_id = e.searchId),
            e.list.length || 0 !== t.length
              ? ((totalEmails = e.total),
                (search_auth = e.auth),
                await parseEmailList(e, t))
              : (await searchEmailsInBing(currentHost),
                Object.keys(emailList).length || showNotFoundMessage()))
        : showNotFoundMessage());
}
async function getCompanyByDomain(e) {
  try {
    var t = await apiGetCompanyInfo({ url: e });
    $contentPage.removeClass("hidden"),
      $searchBlock.addClass("hidden"),
      t?.errors ||
        ((companyID = t.id),
        updateCompanyTemplate(t, search_id),
        $("#only_prospects").prop("disabled", !1),
        $contentPage.removeClass("hidden"),
        $searchBlock.addClass("hidden"));
  } catch {
    hideProspectsContainer();
  }
}
async function getProspectsByCompany() {
  if (companyID)
    try {
      var e = await apiGetProspectsByCompany("companyId=" + companyID);
      (companyData = e),
        (selectedProspectIDs = e.prospects.map((e) => e.id)),
        (prospectLists = e.prospects
          .filter((e) => e.lists.length)
          .map((e) => [e.id, e.lists.map((e) => e.id)])),
        renderProspects();
    } catch {
      hideProspectsContainer();
    }
  else hideProspectsContainer();
}
function addHandlerToUserListsLoaded() {
  $(window).on("userListsLoaded", function (e, t, s, a) {
    (userLists_prospects = s),
      (maDefaultListId = localStorage[LS_LastPeopleListId] || 0),
      showAvailableLists(
        userLists_prospects,
        "userPeopleSelect",
        maDefaultListId,
        a
      ),
      (maDefaultListId = $userPeopleSelect
        .find('input[name="usersList"]:checked')
        .val()),
      a ||
        ($btnSendProspectList.on("click", sendProspectList),
        $btnSendEmailList.on("click", sendEmailList),
        $("#listNameInput").on("keyup", _keyupEvent),
        $("#userPeopleSelect").removeClass("hidden"),
        $("#refreshPeopleSelect").on("click", function (e) {
          e.stopPropagation(),
            $(".js-toggle-new-list").hasClass("pfe-select__static--disabled") ||
              ($("#refreshPeopleSelect").addClass("icon-refresh-animate"),
              updateUserLists("people", !0));
        }),
        ($select = $("#userPeopleSelect")).on(
          "change",
          "input[type=radio]",
          function () {
            $("#selectedItemUsersPeopleList").text($(this).attr("data-text")),
              (maDefaultListId = $select
                .find('input[name="usersList"]:checked')
                .val()),
              (localStorage[LS_LastPeopleListId] = maDefaultListId),
              hideDropdownList();
          }
        )),
      $("#refreshPeopleSelect").removeClass("icon-refresh-animate");
  });
}
async function parseEmailList(e, t = []) {
  var s = addEmailsFromPage(e.list, t);
  for (let e = 0; e < s.length; e++) emailList["el" + e] = s[e];
  (selectedEmails = Object.values(emailList).map((e) => e.email)),
    chrome.runtime.sendMessage({ type: "ga", action: "domainSearchShow" }),
    emailList && Object.keys(emailList).length < 10
      ? await searchEmailsInBing(currentHost)
      : renderEmails(selectedEmails, e.searchId);
}
function addEmailsFromPage(t, s = []) {
  if (0 !== s.length) {
    var a = t.map((e) => e.email.toLowerCase());
    let e = 0;
    for (const n of s)
      if (!a.includes(n.toLowerCase()) && (t.push({ email: n }), 5 === ++e))
        break;
  }
  return t;
}
function authProcessing() {
  (localStorage.userName = ""),
    checkAuthenticationUpdate(function () {
      showUserName();
    });
}
async function searchEmailsInBing(e) {
  return parseSearchEmailsInBing(
    await $.get('http://www.bing.com/search?q="*%40' + e + '"'),
    e
  );
}
function parseSearchEmailsInBing(e, t) {
  e = (e = e.replace(/<strong>/gi, "")).replace(/<\/strong>/gi, "");
  var s = searchEmailsO(e, t) || [];
  if (s?.length || Object.keys(emailList).length) {
    let t = 0;
    for (var a in emailList) {
      a = s.indexOf(emailList[a].email);
      -1 !== a && s.splice(a, 1), t++;
    }
    for (let e = 0; e < s.length; e++) {
      var n = {};
      (n.email = s[e]), (emailList["el" + t] = n), t++;
    }
    return renderEmails(
      (selectedEmails = Object.values(emailList).map((e) => e.email))
    );
  }
}
async function sendEmailList(e = {}, t = {}) {
  var s = $(t).attr("data-email");
  checkValidUserListName(e) &&
    ((t = prepareSendToListAndGetData(t, {
      $btn: $btnSendEmailList,
      single: s,
      list: Object.keys(emailList),
      tabName: "email",
    })),
    sentSinglEmeilsCounter++,
    (t = getParamsToAddedList(t, "emails")),
    handleResponseSendEmailList(await apiPeopleCreateFromEmail(t), e, s));
}
function handleResponseSendEmailList(e = {}, t = {}, s = "") {
  sentSinglEmeilsCounter--,
    e.code && e.code === ErrorListIdStatusCode
      ? (showErrorGlobal(
          getMessage("cantFindList", DefaultValuesLang.cantFindList),
          getMessage("selectAnotherList", DefaultValuesLang.selectAnotherList)
        ),
        updateUserLists("people", !0),
        toggleStatusAttribute(".main-body", "error"),
        $("#domainEmails").hide(),
        $("#prospectsContainer").hide(),
        $(t.target).button("reset"),
        showListsForEmails(e, emailList, t, { single: s, savedContacts: !0 }))
      : e.code
      ? (toggleStatusAttribute(".main-body", "error"),
        showListsForEmails(e, emailList, t, { single: s, savedContacts: !0 }))
      : ($(window).trigger("contactsSaving", [t]),
        sendMessageSearchSaveSelected(),
        showListsForEmails(e, emailList, t, { single: s, savedContacts: !0 }),
        loadUserLists("people", !0),
        sentSinglEmeilsCounter ||
          checkSelected($domainEmails, BTN_SEND_EMAIL_LIST, SELECT_ALL_EMAILS));
}
async function sendProspectList(e = {}, t = {}) {
  var s = $(t).attr("data-prospect");
  checkValidUserListName(e) &&
    ((t = prepareSendToListAndGetData(t, {
      $btn: $btnSendProspectList,
      single: s,
      list: selectedProspectIDs,
      tabName: "prospect",
    })),
    sentSingleProspectsCounter++,
    await checkProspectContacts(
      await putToUserLists(getParamsToAddedList(t, "prospects"), s, e),
      t
    ));
}
async function putToUserLists(e = {}, t = "", s = {}) {
  var e = await apiPeopleAddToList(e),
    a = e && e.success;
  return (
    a &&
      (sentSingleProspectsCounter--,
      reRenderProspectList(selectedProspectIDs, !0, t, "prospect"),
      emitContactsSaved(!t, s),
      sentSingleProspectsCounter ||
        checkSelected(
          $prospectsContainer,
          BTN_SEND_PROSPECT_LIST,
          SELECT_ALL_PROSPECTS
        )),
    e.errors &&
      e.message &&
      ((lowBalance = !0),
      toggleStatusAttribute(".main-body", "error"),
      (t = APP_HOST + "/pricing-plans"),
      (s = `
            ${e.message}
            <a href="${t}" target="_blank" class="pfe-button pfe-button--primary">
            <img src="../img/svg/star.svg" alt="" class="icon icon--up">
            ${getMessage("upgradePlan", "Upgrade my plan")}</a>`),
      showErrorContent(s)),
    a
  );
}
async function checkProspectContacts(e = !1, s = []) {
  e &&
    (e = companyData.prospects
      .filter((t) => {
        var e = !!s.find((e) => e === t.id);
        return !t.emails.length && e;
      })
      .map((e) => e.id)).length &&
    (renderSearchEmails(e, SEARCH_TEXT_LOADER), await getContactsProspect(e));
}
async function getContactsProspect(e = []) {
  e = e.map((e) => "prospects[]=" + e).join("&");
  let t = [];
  try {
    var s,
      a = (await apiGetSearchContacts("?" + e)).prospects;
    a.length &&
      (countAttemptsGetContactProspect++,
      (s = a.filter((e) => e.emails.length)),
      (t = a.filter((e) => e.in_progress).map((e) => e.id)),
      s.forEach((e) => {
        appendTextToEmail(e.emails[0])(e.id);
      }),
      countAttemptsGetContactProspect < maxCountAttemptsGetContactProspect &&
      t.length
        ? setTimeout(getContactsProspect, 1e3, t)
        : (countAttemptsGetContactProspect !==
            maxCountAttemptsGetContactProspect &&
            t.length) ||
          ((countAttemptsGetContactProspect = 0),
          checkLoaderInEmailsElement()));
  } catch {
    renderSearchEmails(t, ""), (countAttemptsGetContactProspect = 0);
  }
}
function prepareSendToListAndGetData(e = {}, t = {}) {
  var { $btn: t = {}, single: s = "", list: a = [], tabName: n = "" } = t,
    e =
      ($(e).addClass("hidden"),
      t.attr("disabled", !0),
      getListOfPerson(s, a, n));
  return e;
}
function getParamsToAddedList(e = [], t = "") {
  var s = getNewUserList(),
    t = { [t]: e };
  return (
    s
      ? (t.listName = s)
      : !s && maDefaultListId && (t.listId = maDefaultListId),
    t
  );
}
function renderSearchEmails(e = [], t = "") {
  e.forEach(appendTextToEmail(t));
}
function appendTextToEmail(t = "") {
  return function (e) {
    $("#person_" + e)
      .find(".prospect-info__email")
      .text(t);
  };
}
function checkLoaderInEmailsElement() {
  $(".prospect-item .prospect-info__email").each(function () {
    $(this).text() === SEARCH_TEXT_LOADER && $(this).text("");
  });
}
function showListsForEmails(e, t, s, a = {}) {
  var n = e.success && !a.single && a.savedContacts;
  reRenderProspectList(Object.keys(t), e.success, a.single, "email"),
    emitContactsSaved(n, s);
}
function reRenderProspectList(e = [], n = !1, i = "", o = "") {
  e.forEach((e) => {
    var t = $("#person_" + e),
      s = i && t.attr("data-" + o) === i,
      a = !i && t.find("input")[0].checked;
    (s || a) &&
      (n
        ? (t.find("input").prop("checked", !1), refreshItemListLinks(e))
        : t.addClass("error"));
  });
}
function emitContactsSaved(e = !1, t = {}) {
  e && $(window).trigger("contactsSaved", [t]);
}
function completeSearchResults(e) {
  e
    ? _showCompleteSearchBtn(e)
    : search_auth || $domainEmails.css("max-height", "315px");
}
async function renderEmails(e = []) {
  renderItemTemplate($domainEmails, "emailItemTemplate", e, {
    appendElementsCallback: appendEmailElements,
    tabName: "email",
    btnSendName: BTN_SEND_EMAIL_LIST,
    btnSelectAllName: SELECT_ALL_EMAILS,
  }),
    search_id &&
      addButtons("domainEmails", e.length, totalEmails, {
        btnSendName: BTN_SEND_EMAIL_LIST,
        btnSelectAllName: SELECT_ALL_EMAILS,
        showAllLink: bestHistoryCompanyEmailsUrl(),
      }),
    $domainEmails.find(".add-to-list-email").on("click", function (e) {
      sendEmailList(e, this);
    }),
    completeSearchResults(search_id),
    await checkPrevAddedEmails(emailList, userLists_prospects),
    $domainEmails.removeClass("hidden");
}
function renderProspects() {
  selectedProspectIDs.length
    ? (renderItemTemplate(
        $prospectsContainer,
        "prospectItemTemplate",
        selectedProspectIDs,
        {
          appendElementsCallback: appendProspectElements,
          tabName: "prospect",
          btnSendName: BTN_SEND_PROSPECT_LIST,
          btnSelectAllName: SELECT_ALL_PROSPECTS,
        }
      ),
      isAuth &&
        addButtons(
          "prospectsContainer",
          companyData.prospects.length,
          companyData.total_prospects,
          {
            btnSendName: BTN_SEND_PROSPECT_LIST,
            btnSelectAllName: SELECT_ALL_PROSPECTS,
            showAllLink: companyUrl(),
          }
        ),
      localStorage.userList_people &&
        (renderContactListSection(prospectLists, localStorage.userList_people),
        $prospectsContainer.removeClass("hidden")),
      $prospectsContainer
        .find(".add-to-list-prospect")
        .on("click", function (e) {
          sendProspectList(e, this);
        }),
      completeSearchResults(search_id),
      checkSelected(
        $prospectsContainer,
        BTN_SEND_PROSPECT_LIST,
        SELECT_ALL_PROSPECTS
      ))
    : hideProspectsContainer();
}
function renderContactListSection(e = [], s = "") {
  e.forEach(([e, t]) => {
    toggleStatusClass("#person_" + e, "saved");
    (e = $("#person_" + e)),
      e.addClass("saved__already").find("input").prop("checked", !1),
      (t = getFistListAndCountById(s, t));
    e.find(".js-contact-saved-list").html(t);
  });
}
function bestHistoryCompanyEmailsUrl() {
  return (
    getMainHost() + "/plugin/history-best-company/" + search_id + "?tab=emails"
  );
}
function companyUrl() {
  return getMainHost() + "/companies/view/" + companyID;
}
async function checkPrevAddedEmails(s = {}, e = "") {
  if (isAuth) {
    var t,
      a = [];
    for (t in s) a.push(s[t].email);
    var n = await apiGetListsByEmails(a);
    n?.errors || !n.list
      ? showNotFoundMessage()
      : ((n = n.list.map((t) => {
          return [
            Object.keys(s)
              .filter((e) => s[e].email === t.email)
              .join(" "),
            t.listIds,
          ];
        })),
        $("#domainEmails .add-to-list-email").removeClass("hidden"),
        renderContactListSection(n, e),
        checkSelected($domainEmails, BTN_SEND_EMAIL_LIST, SELECT_ALL_EMAILS));
  }
}
initPage(initPopupTabsQuery);
