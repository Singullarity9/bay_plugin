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
