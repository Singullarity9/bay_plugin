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
function post(a, t, options = {}) {
  return fetch(a, {
    method: "POST",
    body: JSON.stringify(t),
    headers: { ...options, ...DEFAULT_HEADERS },
  });
}
function put(a, t) {
  return fetch(a, {
    method: "PUT",
    body: JSON.stringify(t),
    headers: DEFAULT_HEADERS,
  });
}
function get(a, options = {}) {
  return fetch(a, {
    method: "GET",
    headers: { ...options, ...DEFAULT_HEADERS },
  });
}

async function apiGetEmailsByDomain(a) {
  a = await (
    await post(
      "https://mktest.beiniuyun.cn/admin-api/marketing/resource-grab/extract-html",
      a,
      {
        Authorization: accessToken,
        ["tenant-id"]: tenantId,
      }
    )
  ).json();
  return a;
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
async function apiGetUserBalance(headers) {
  var a = await (
    await get(
      "https://mktest.beiniuyun.cn/admin-api/system/member/rights-user/get?rightsType=6",
      headers
    )
  ).json();
  return a;
}
