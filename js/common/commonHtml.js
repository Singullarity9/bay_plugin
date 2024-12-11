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
