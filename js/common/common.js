const LS_LastPeopleListId = "lastPeopleListId",
  LS_LastCompanyListId = "lastCompanyListId",
  LS_referrer = "referrer",
  CHROME_STORE_ID = "einnffiilpmgldkapbikhkeicohlaapj";
let isAuth = !1,
  lowBalance = !1,
  userLists_prospects,
  userLists_companies,
  accessToken,
  tenantId;

async function initPage(e = () => {}) {
  appendHeader(),
    localizeHtmlCommon(),
    addExtensionVersionToHeader(),
    addEventListenersToHeader(),
    // await handlePromotion(),
    await getUserBalance(),
    addChromeSendMessageCheckNews(),
    e();
  // (await checkForNewExtensionVersion()) || e();
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
                <a id="companiesHistory" href="https://mktest.beiniuyun.cn/#/marketing/resource/resource-users" target="_blank" class="header__content-link" title="${getMessage(
                  "searchHistory",
                  "Сompany search history"
                )}">
                    <img src="../img/svg/history.svg" alt="history">
                </a>   
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
                <a href="https://mktest.beiniuyun.cn/#/register" target="_blank" class="header__content-link sign-up hidden regLink" id="signUpLink">
                    ${getMessage("signUp", "Sign up")}
                </a>   
                <a href="https://mktest.beiniuyun.cn/#/user/profile" target="_blank" class="header__content-link loginLink">
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
  e = "https://mktest.beiniuyun.cn/#" + "/" + e;
  return e;
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
  const headers = {};
  await chrome.cookies.get(
    { url: "https://mktest.beiniuyun.cn/", name: "TENANT_ID" },
    function (e) {
      if (e) {
        tenantId = e.value;
        headers["tenant-id"] = e.value;
        chrome.cookies.get(
          { url: "https://mktest.beiniuyun.cn/", name: "ACCESS_TOKEN" },
          async function (e) {
            if (e) {
              accessToken = `Bearer ${e.value}`;
              headers["Authorization"] = `Bearer ${e.value}`;
              var t = await apiGetUserBalance(headers);
              if (t && t.code === 0) {
                var a =
                  !$("body").data("page") ||
                  "yelp-company" !== $("body").data("page");
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
              } else {
                showLoginBtn(),
                  toggleStatusAttribute(".main-body", "no_login"),
                  $(".main-footer").hide(),
                  $(".js-footer").addClass("hidden"),
                  $("#completeSearchTemplate").hide();
              }
            }
          }
        );
      } else {
        showLoginBtn(),
          toggleStatusAttribute(".main-body", "no_login"),
          $(".main-footer").hide(),
          $(".js-footer").addClass("hidden"),
          $("#completeSearchTemplate").hide();
      }
    }
  );
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
