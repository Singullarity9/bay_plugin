var e_e,
  people = [],
  maDefaultPeopleListId = 0,
  personTemplate = $("#personTemplate").html(),
  $peopleList = $("#peopleList"),
  twitterCsrfToken = "",
  $userPeopleSelect = $("#userPeopleSelect");
async function initChromeTabsQuery() {
  chrome.tabs.query({ active: !0, currentWindow: !0 }, (e) => {
    setEventsOnFooterDropdown(),
      (maDefaultPeopleListId = localStorage[LS_LastPeopleListId] || 0),
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
function initChromeTabSendMessage(o = {}) {
  chrome.tabs.sendMessage(o.id, { method: "getInnerHTML" }, (e) => {
    const t = o.url.replace("https://twitter.com/", "").toLowerCase();
    e ||
      (toggleStatusAttribute(".main-body", "error"),
      $("#peopleList").addClass("hidden"),
      $(".main-footer").addClass("hidden"));
    var s = $(".main-footer")[0].offsetHeight || 0;
    if (
      (initResizeObserver([$(".people-list")], $("#top")[0], {
        viewHeight: 520,
        otherElementsHeight: s,
      }),
      -1 !== t.indexOf("f=user"))
    ) {
      if (!(people = getUserListFromSearch(e.data)) || !people.length)
        return (
          $("#notFoundTemplate").removeClass("hidden"),
          $(".main-footer").addClass("hidden"),
          $(".btn.btn-primary").addClass("disabled"),
          void listItemsEventHandlers()
        );
      renderPeopleList(people), $("#peopleTabLink").tab("show");
    }
    chrome.cookies.get(
      { url: "https://twitter.com", name: "ct0" },
      function (e) {
        e.value || showNotLoginTwitter(),
          -1 === t.indexOf("f=user") && e.value
            ? ($(".main-footer").addClass("hidden"),
              $(".tab-content").hide(),
              isAuth
                ? $(document.body).append($("#currentHostEmptyTemplate").html())
                : ($(".tab-content").show(),
                  $("#errorTemplates").addClass("mb-24"),
                  $(".host-empty-template").remove(),
                  $("#peopleList").remove()))
            : (twitterCsrfToken = e.value || "");
      }
    ),
      listItemsEventHandlers();
  });
}
async function sendPeople_Search(t, s, o = []) {
  if (t && 0 !== t.length && (s.preventDefault(), checkIfValidNewListName(s))) {
    let e = null;
    (s = { people: t }),
      (t =
        ((e = $(".js-add-new-list-container").hasClass("hidden")
          ? e
          : $("#listNameInput").val())
          ? (s.listName = e)
          : (s.listId = $userPeopleSelect
              .find('input[name="usersList"]:checked')
              .val()),
        await apiPeopleCreate(s)));
    if (($("#warning2").addClass(" hidden"), t.code)) {
      if (t.code !== ErrorListIdStatusCode) return;
      updateUserLists("people", !0),
        $("#warningMessage").text(t.message),
        toggleStatusAttribute("#errorTemplates", "warning"),
        $("#errorTemplates").addClass("mb-24"),
        $("#sendPeople").button("reset").button("toggle"),
        o.forEach((e) => {
          toggleStatusClass("#person_" + e, "error");
        }),
        setTimeout(() => {
          $("#errorTemplates").removeAttr("data-status"),
            $(".people-list").removeClass("people-list--small");
        }, 3e3);
    }
    $("#savedProspects").removeClass(" hidden"),
      o.forEach((e) => {
        refreshItemListLinks(e);
      }),
      $(window).trigger("contactsSaved", [e_e]);
  }
}
function sendPeopleDef(e) {
  if ((e.preventDefault(), checkIfValidNewListName(e)))
    if (
      ($(window).trigger("contactsSaving", [e]),
      people || $(window).trigger("contactsSavingReset", [e]),
      0 === $peopleList.find(".js-list-item input:checked").length)
    )
      $(window).trigger("contactsSavingReset", [e]);
    else {
      (e_e = e),
        $("#autoSearch").addClass(" hidden"),
        $(".people-list").addClass("people-list--small"),
        $("#warning2").removeClass("hidden");
      let s = [],
        a = [],
        n = 0,
        l = 0;
      for (let o = 0; o < people.length; o++)
        if ($("#person_" + people[o].index_num).find("input")[0].checked) {
          toggleStatusClass("#person_" + people[o].index_num, "processing");
          var i = new Promise((e, t) => {
            var s = setTwitterUserInfo(people[o].source_id_2, twitterCsrfToken);
            e(s), t(s);
          });
          let t = people[o].index_num;
          n++,
            i
              .then((e) => {
                Object.keys(e).length
                  ? (a.push(e),
                    toggleStatusClass("#person_" + t, "saved-item"),
                    s.push(t),
                    ++l === n && sendPeople_Search(a, e_e, s))
                  : (toggleStatusClass("#person_" + t, "error"),
                    ++l === n && sendPeople_Search(a, e_e));
              })
              .catch(() => {
                toggleStatusClass("#person_" + t, "error"),
                  ++l === n && sendPeople_Search(a, e_e);
              });
        }
    }
}
function _renderPerson(e) {
  var t,
    s = people[e];
  s.name &&
    ((s.index_num = "in" + e),
    (e = $(personTemplate)).attr("id", "person_" + s.index_num),
    e.find('[type="checkbox"]').val(s.index_num),
    e.find(".js-contact-name").text(truncText(s.name, 23)),
    (t = e.find(".js-contact-avatar > img")),
    s.logo ? t.attr("src", s.logo) : t.attr("src", "../img/ghost_person.png"),
    $("#peopleList .people-list").append(e));
}
function renderPeopleList(o) {
  if (o) {
    for (let e = 0; e < o.length; e++) o[e] && _renderPerson(e);
    $(window).on("userListsLoaded", function (e, t, s) {
      "people" === t &&
        ((userLists_prospects = s),
        showAvailableLists(s, "userPeopleSelect", maDefaultPeopleListId),
        1 !== $("#refreshPeopleSelect").data("has-event") &&
          $("#refreshPeopleSelect").on("click", function (e) {
            $(this).parent().hasClass("pfe-select__static--disabled") ||
              (e.stopPropagation(),
              $(this).data("has-event", 1),
              $("#refreshPeopleSelect").addClass("icon-refresh-animate"),
              updateUserLists("people", !0));
          }),
        (maDefaultPeopleListId = $userPeopleSelect
          .find('input[name="usersList"]:checked')
          .val()),
        (localStorage[LS_LastPeopleListId] = maDefaultPeopleListId),
        $("#refreshPeopleSelect").removeClass("icon-refresh-animate"),
        checkPrevAddedPeople(o, s));
    }),
      loadUserLists("people", !0),
      $("#sendPeople").on("click", sendPeopleDef),
      2 < o.length && addSelectAll("#peopleList");
  }
}
function addSelectAll(e) {
  var t = $("#selectAllTemplate").html();
  $(e).prepend(t),
    $(e).on("change", '[name="selectAll"]', function () {
      var e = $(this),
        t = e.closest("section").find(".js-list-item"),
        s = e.is(":checked");
      t.find("input:checked").length === t.length
        ? t.each(updateTwitterItemCheckbox(s))
        : (t.each(updateTwitterItemCheckbox(!0)),
          e.prop("checked", !0),
          e.trigger("change")),
        reRenderCountOfSelectedItems($peopleList, $("#selectAll")),
        toggleSendPeople();
    });
}
function listItemsEventHandlers() {
  $peopleList.on("change", ".js-list-item input", function (e) {
    "error" === $(".main-body").data("status") &&
      ($(this).prop("checked")
        ? $(this).parents(".person-found__list-item").addClass("no-credits")
        : $(this)
            .parents(".person-found__list-item")
            .removeClass("no-credits")),
      reRenderCountOfSelectedItems($peopleList, $("#selectAll")),
      toggleSendPeople();
  });
}
async function checkPrevAddedPeople(e, t) {
  var s,
    o = await apiGetListsByPeoplesIds(e);
  if (o.list) {
    for (var a in o.list)
      o.list[a].disabled
        ? $("#person_" + a)
            .addClass("unsavable")
            .prop(
              "title",
              getMessage(
                "deletedProfile",
                "This profile can not be saved due to owner's request"
              )
            )
            .find("input")
            .prop("checked", !1)
            .prop("disabled", !0)
        : (toggleStatusClass("#person_" + a, "saved"),
          (a =
            ((s = $("#person_" + a))
              .addClass("saved__already")
              .find("input")
              .prop("checked", !1),
            getFistListAndCountById(t, o.list[a]))),
          s.addClass("saved__already").find("input").prop("checked", !1),
          s.find(".js-contact-saved-list").html(a));
    "error" === $(".main-body").data("status") && clearCheckboxes(),
      reRenderCountOfSelectedItems($peopleList, $("#selectAll")),
      toggleSendPeople();
  }
}
function clearCheckboxes() {
  $("#peopleList input:checked").each(function () {
    $(this).prop("checked", !1);
  });
}
function toggleSendPeople() {
  var e = $peopleList.find(".js-list-item input:checked").length;
  "error" !== $(".main-body").data("status") && e
    ? $("#sendPeople").attr("disabled", !1)
    : $("#sendPeople").attr("disabled", !0);
}
initPage(initChromeTabsQuery);
