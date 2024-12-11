var e_e,
  person = {},
  maDefaultListId = 0,
  $userPeopleSelect = $("#userPeopleSelect"),
  countAttemptsGetEmail = 0,
  maxCountAttemptsGetEmail = 10;
function initTwitterTabsQuery() {
  chrome.tabs.query({ active: !0, currentWindow: !0 }, (e) => {
    if (isAuth) {
      setEventsOnFooterDropdown(),
        (maDefaultListId = localStorage[LS_LastPeopleListId] || 0),
        $userPeopleSelect.on("change", "input[type=radio]", function () {
          $("#selectedItemUsersPeopleList").text($(this).attr("data-text")),
            (maDefaultListId = $userPeopleSelect
              .find('input[name="usersList"]:checked')
              .val()),
            (localStorage[LS_LastPeopleListId] = maDefaultListId),
            hideDropdownList();
        });
      const a = e[0].url.replace("https://twitter.com/", "").toLowerCase();
      $("#emails").on("click", ".js-copyEmail", copyEmailValue),
        chrome.cookies.get(
          { url: "https://twitter.com", name: "ct0" },
          function (e) {
            if (e.value)
              if (
                -1 !==
                [
                  "f=live",
                  "f=image",
                  "f=video",
                  "src=recent_search_click",
                ].indexOf(a)
              )
                $(".main-footer").addClass("hidden"),
                  $("#personInfoBody").hide(),
                  $(document.body).append(
                    $("#currentHostEmptyTemplate").html()
                  ),
                  toggleStatusAttribute(".main-body", "error");
              else {
                let o = e.value || "";
                new Promise((e, t) => {
                  var s = setTwitterUserInfo(a, o);
                  e(s), t(s);
                })
                  .then((e) => {
                    Object.keys(e).length
                      ? ((person = e), showUserInfo())
                      : ($("#warningLoginTwitter").removeClass("hidden"),
                        $(".main-footer").addClass("hidden"));
                  })
                  .catch(() => {
                    $(".main-footer").addClass("hidden");
                    let t = !1;
                    [
                      "explore",
                      "notifications",
                      "messages",
                      "bookmarks",
                      "lists",
                      "topics",
                    ].forEach((e) => {
                      -1 !== a.indexOf(e) && (t = !0);
                    }),
                      -1 ===
                        ["no_login", "warning", "no_login_twitter"].indexOf(
                          $(".main-body").attr("data-status")
                        ) && t
                        ? ($("#personInfoBody").hide(),
                          $(document.body).append(
                            $("#currentHostEmptyTemplate").html()
                          ))
                        : "no_login_twitter" !==
                            $(".main-body").attr("data-status") &&
                          toggleStatusAttribute(".main-body", "error");
                  });
              }
            else showNotLoginTwitter();
          }
        );
    }
  });
}
function showPersonInfo(e) {
  let s = $("#personInfoBody");
  function t(e, t) {
    t = s.find(t);
    e && t && t.append(e);
  }
  var o = s.find(".js-contact-avatar > img");
  e.logo ? o.attr("src", e.logo) : o.attr("src", "../img/ghost_person.png"),
    t(e.name, ".js-contact-name"),
    t(e.description, ".js-contact-description"),
    e.current &&
      e.current[0] &&
      t(e.current[0].company_name, ".js-contact-info"),
    s.find(".media").removeClass("hidden"),
    toggleStatusAttribute(".main-body", "found"),
    "error" !== $(".main-body").attr("data-status") &&
      $("#sendPerson").attr("disabled", !1);
}
function showEmails(e) {
  let t = $("#emails");
  var s;
  e && "empty result" !== e
    ? ((s = []),
      0 < (s = e).length &&
        (t.text(""),
        s.forEach((e) => {
          t.append(`<div class="pfe-profile__email-item">
                    <span>${e}</span>
                    <div class="pfe-profile__email-copy js-copyEmail"></div>
                </div>`);
        })),
      toggleStatusAttribute(".main-body", "already-saved"))
    : (t.html(`<div class="pfe-profile__email-item pfe-profile__email-item--empty">
            <span>${getMessage("emailsNotFound", "Emails not found")}</span>
        </div>`),
      $("#tryDBSearch").removeClass("hidden"),
      toggleStatusAttribute(".main-body", "not-find-contacts")),
    t.removeClass("hidden"),
    (t.style = "opacity: 1!important");
}
async function getPersonEmails(e) {
  var t;
  (e || e.source_id_2 || e.source_id) &&
    ((t = {}),
    e.source_id && (t.sourceId = e.source_id),
    e.source_id_2 && (t.sourceId2 = e.source_id_2),
    (t = await apiGetProspectEmails(t)).result) &&
    (++countAttemptsGetEmail === maxCountAttemptsGetEmail
      ? showEmails(t.contacts ?? "empty result")
      : +response.result in
        { 2: "search in progress", 3: "prospect not saved yet" }
      ? setTimeout(getPersonEmails, 5e3, e)
      : t.contacts && showEmails(t.contacts));
}
function parseResponsePerson(e) {
  e && e.success
    ? (toggleStatusClass("#personInfoBody > .media", "saved"),
      toggleStatusAttribute(".main-body", "saved"),
      "error" !== $(".main-body").attr("data-status") &&
        $("#sendPerson").attr("disabled", !1),
      setTimeout(getPersonEmails, 5e3, person))
    : (toggleStatusClass("#personInfoBody > .media", "error"),
      (document.getElementById("error").innerText = e.message),
      8 === e.code &&
        ((e = e.message),
        showError(
          getMessage("somethingWentWrong", "Oops, something went wrong"),
          e,
          "#error"
        ),
        (-1 === error.messag1e.indexOf("your paid plan has hit its limit") &&
          -1 === error.message1.indexOf("you ran out of credits")) ||
          showError(
            getMessage(
              "outOfCreditsTwTitleProspects",
              "You're out of credits."
            ),
            getMessage(
              "outOfCreditsTwTextProspects",
              "To continue saving prospects, get more credits by renewing or upgrading your plan."
            ),
            "#error"
          ),
        -1 !== error.message1.indexOf("your account limit of") &&
          showError(
            getMessage(
              "dailyLimitTitle",
              "You've hit your daily limit of 10 credits."
            ),
            getMessage(
              "dailyLimitContent",
              "To remove this limit and continue saving prospects, please upgrade to a premium account."
            ),
            "#error"
          ),
        toggleStatusAttribute(".main-body", "error")));
}
async function sendPerson(e) {
  e.preventDefault();
  let t = null;
  $(".js-add-new-list-container").hasClass("hidden") ||
    (t = $("#listNameInput").val());
  var s = { people: [person] },
    s =
      (t ? (s.listName = t) : (s.listId = maDefaultListId),
      await apiPeopleCreate(s));
  s.code === ErrorListIdStatusCode
    ? (showError(
        getMessage("cantFindList", DefaultValuesLang.cantFindList),
        getMessage("selectAnotherList", DefaultValuesLang.selectAnotherList),
        !1,
        !1
      ),
      toggleStatusAttribute(".main-body", "error"),
      updateUserLists("people", !0),
      $("#tryDBSearch").hide(),
      $(e.target).button("reset"))
    : (parseResponsePerson(s), $(window).trigger("contactsSaved", [e_e]));
}
async function checkPrevAddedPeople(e, t) {
  var s = await apiGetListsByPeoplesIds([{ ...e, index_num: "in0" }]);
  s.list &&
    0 !== s.list.length &&
    (s.list.in0.disabled
      ? ($("#personInfoBody > .media")
          .addClass("unsavable")
          .prop(
            "title",
            getMessage(
              "deletedProfile",
              "This profile can not be saved due to owner's request"
            )
          ),
        $("#sendPerson").attr("disabled", !0))
      : (toggleStatusClass("#personInfoBody > .media", "saved"),
        (t = getListNameById(t, s.list.in0)),
        fillContactSavedList(
          $("#personInfoBody").find(".js-contact-saved-list"),
          t,
          40
        ),
        (maxCountAttemptsGetEmail = 1),
        "error" !== $(".main-body").attr("data-status") &&
          $("#sendPerson").attr("disabled", !1),
        getPersonEmails(e)));
}
function sendCurrent(e) {
  e.preventDefault(),
    checkIfValidNewListName(e) &&
      ($(window).trigger("contactsSaving", [e]),
      toggleStatusClass("#personMedia", "processing"),
      toggleStatusAttribute(".main-body", "processing"),
      (e_e = e),
      person) &&
      person.name &&
      sendPerson(e);
}
function showUserInfo() {
  showPersonInfo(person),
    person.loggedIn &&
      ($("#warningLoginTwitter").removeClass("hidden"),
      toggleStatusAttribute(".main-body", "no_login")),
    $(window).on("userListsLoaded", function (e, t, s) {
      (userLists_prospects = s),
        showAvailableLists(s, "userPeopleSelect", maDefaultListId),
        1 !== $("#refreshPeopleSelect").data("has-event") &&
          ($("#sendPerson").on("click", sendCurrent),
          $("#refreshPeopleSelect").on("click", function (e) {
            $(this).parent().hasClass("pfe-select__static--disabled") ||
              (e.stopPropagation(),
              $(this).data("has-event", 1),
              $("#refreshPeopleSelect").addClass("icon-refresh-animate"),
              updateUserLists("people", !0));
          })),
        (maDefaultListId = $userPeopleSelect
          .find('input[name="usersList"]:checked')
          .val()),
        (localStorage[LS_LastPeopleListId] = maDefaultListId),
        $("#refreshPeopleSelect").removeClass("icon-refresh-animate"),
        checkPrevAddedPeople(person, s);
    }),
    loadUserLists("people", !0);
}
function copyEmailValue() {
  var e = $("<input>");
  $("body").append(e),
    e.val($(this).prev().text()).select(),
    document.execCommand("copy"),
    e.remove();
}
function showError(e, t, s = !0, o = !0) {
  let a = e ? `<h3>${e}</h3>` : "";
  (a += t ? `<p class="pfe-alert__text">${t}</p>` : ""),
    s &&
      (a =
        (a += `<a href="${APP_HOST}/pricing-plans" class="pfe-button pfe-button--primary" target="_blank">`) +
        `<img src="../img/svg/star.svg" alt="" class="icon icon--up">${getMessage(
          "upgradePlan",
          "Upgrade my plan"
        )}</a>`),
    o && $("#error").addClass("mb-15"),
    $("#error").html(a);
}
initPage(initTwitterTabsQuery);
