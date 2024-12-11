const regPageLang = /\?l=(.+?)"/im;
let pageLang = "en_us",
  company = {},
  maDefaultListId = 0,
  $select = $("#userCompaniesSelect");
function initYelpChromeTabsQuery() {
  chrome.tabs.query({ active: !0, currentWindow: !0 }, (e) => {
    setEventsOnFooterDropdown(),
      (maDefaultListId = localStorage[LS_LastCompanyListId] || 0),
      chrome.tabs.sendMessage(
        e[0].id,
        { method: "getInnerHTML" },
        function (e) {
          var a;
          e &&
          ((pageLang = (pageLang = findDescrByRegEx(
            e.data,
            regPageLang
          )).toLowerCase()),
          (a = new YelpCompanyParser()),
          (company = a.findCompanyInfo(e.data)))
            ? (showCompanyInfo(company),
              prepareCompanyToSend(company),
              $(window).on("userListsLoaded", function (e, a, t) {
                (userLists_companies = t),
                  showAvailableLists(t, "userCompaniesSelect", maDefaultListId),
                  1 !== $("#refreshCompanySelect").data("has-event") &&
                    $("#refreshCompanySelect").click(function (e) {
                      $(this)
                        .parent()
                        .hasClass("pfe-select__static--disabled") ||
                        ($(this).data("has-event", 1),
                        e.stopPropagation(),
                        $("#refreshCompanySelect").addClass(
                          "icon-refresh-animate"
                        ),
                        updateUserLists("company", !0));
                    }),
                  (maDefaultListId = $select
                    .find('input[name="usersList"]:checked')
                    .val()),
                  (localStorage[LS_LastCompanyListId] = maDefaultListId),
                  $("#refreshCompanySelect").removeClass(
                    "icon-refresh-animate"
                  );
              }),
              loadUserLists("company", !0))
            : notFoundResults();
        }
      ),
      $("#sendCompany").on("click", sendCompany),
      $select.on("change", "input[type=radio]", function () {
        $("#selectedItemUsersCompanyList").text($(this).attr("data-text")),
          (maDefaultListId = $select
            .find('input[name="usersList"]:checked')
            .val()),
          (localStorage[LS_LastCompanyListId] = maDefaultListId),
          hideDropdownList();
      });
  });
}
function appendInfo(e, a = null) {
  var t = document.createElement("div");
  a && t.classList.add(a), (t.textContent = e), $("form").append(t);
}
function showCompanyInfo(e) {
  var a;
  e &&
    e.logo &&
    ((a = document.createElement("div")).classList.add(
      "yelp-company-info__img"
    ),
    (a.style.backgroundImage = "url(" + e.logo + ")"),
    $("form").append(a)),
    appendInfo(e.name, "yelp-company-info__title"),
    e.url && appendInfo(e.url, "yelp-company-info__url");
  let t = "";
  e.street && (t += e.street),
    e.state && (t += 0 < t.length ? ", " + e.state : e.state),
    e.country && (t += 0 < t.length ? ", " + e.country : e.country),
    0 < t.length && appendInfo(t, "yelp-company-info__address"),
    e.phone && appendInfo(e.phone, "yelp-company-info__phone");
}
function prepareCompanyToSend(e) {
  return (
    (e.lang = pageLang),
    e.comp_tags && (e.comp_tags = e.comp_tags.split(",")),
    e
  );
}
async function sendCompany(a) {
  if ((a.preventDefault(), checkIfValidNewListName(a))) {
    $(window).trigger("contactsSaving", [a]),
      toggleStatusClass("#companyInfoBody", "processing");
    let e = "";
    $(".js-add-new-list-container").hasClass("hidden") ||
      (e = $("#listNameInput").val());
    var t = { companies: [company] },
      t =
        (e ? (t.listName = e) : (t.listId = maDefaultListId),
        await apiCreateCompany(t));
    parseResponseCompany(t, a);
  }
}
function parseResponseCompany(e, a) {
  e.success
    ? $(window).trigger("contactsSaved", [a])
    : e.code === ErrorParametersStatusCode
    ? showErrorGlobal(
        getMessage("somethingWentWrong", DefaultValuesLang.somethingWentWrong),
        e.message || "Error"
      )
    : e.code === ErrorListIdStatusCode &&
      (showErrorGlobal(
        getMessage("cantFindList", DefaultValuesLang.cantFindList),
        getMessage("selectAnotherList", DefaultValuesLang.selectAnotherList)
      ),
      updateUserLists("company", !0),
      $(a.target).button("reset"));
}
function notFoundResults() {
  $("#error")
    .empty()
    .append($("#notFoundTemplate").html())
    .removeClass("hidden")
    .addClass("show-when-no-login"),
    $(".js-toggle-new-list").addClass("pfe-select__static--disabled"),
    $(".js-footer").find("button").attr("disabled", !0),
    $(".yelp-company-info").hide();
}
initPage(initYelpChromeTabsQuery);
